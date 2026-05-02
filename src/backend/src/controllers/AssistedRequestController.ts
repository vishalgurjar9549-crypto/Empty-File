import { Response, NextFunction } from 'express';
import { Request } from 'express';
import { PrismaAssistedRequestRepository } from '../repositories/PrismaAssistedRequestRepository';
import { RazorpayService } from '../services/RazorpayService';
import { logger } from '../utils/logger';

/**
 * AssistedRequestController
 * 
 * Handles assisted service payment flow:
 * 1. Create Razorpay order (always ₹500, no city-based pricing)
 * 2. Verify payment signature
 * 3. Create assisted request record
 * 
 * ✅ KEY: Completely separate from subscription payment flow
 */
export class AssistedRequestController {
  private repository: PrismaAssistedRequestRepository;
  private razorpayService: RazorpayService;

  constructor(repository: PrismaAssistedRequestRepository) {
    this.repository = repository;
    this.razorpayService = new RazorpayService();

    // Bind methods
    this.createOrder = this.createOrder.bind(this);
    this.verifyPayment = this.verifyPayment.bind(this);
    this.createRequest = this.createRequest.bind(this);
  }

  /**
   * POST /api/assisted/create-order
   * 
   * Create Razorpay order for assisted service
   * ✅ CRITICAL: Amount is ALWAYS ₹500 (50000 paise), hardcoded
   * 
   * Request body: { city }
   * Response: { orderId, amount, currency }
   */
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { city } = req.body;

      if (!city) {
        return res.status(400).json({
          success: false,
          message: 'City is required',
        });
      }

      // ✅ HARDCODED: Amount is always ₹500 (50000 paise)
      const amount = 500 * 100; // 50000 paise
      const receipt = `assist_${Date.now()}`;

      logger.info('Creating assisted order', {
        city,
        amount,
        receipt,
      });

      // Create Razorpay order
      const razorpayOrder = await this.razorpayService.createOrder({
        amount,
        currency: 'INR',
        receipt,
      });

      logger.info('Razorpay order created', {
        orderId: razorpayOrder.id,
        amount,
      });

      // Return order details to frontend
      return res.status(201).json({
        success: true,
        data: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID, // For frontend Razorpay integration
        },
      });
    } catch (error: any) {
      logger.error('Error creating assisted order', {
        error: error.message,
      });

      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create order',
      });
    }
  }

  /**
   * POST /api/assisted/verify-payment
   * 
   * Verify Razorpay payment signature
   * ✅ CRITICAL: Signature verification is the ONLY way to trust payment success
   * 
   * Request body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   * Response: { success: true }
   */
  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      // Validate input
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Order ID, Payment ID, and Signature are required',
        });
      }

      logger.info('Verifying payment signature', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      // Verify signature using RazorpayService
      const isSignatureValid = this.razorpayService.verifySignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (!isSignatureValid) {
        logger.warn('Payment signature verification failed', {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
        });

        return res.status(400).json({
          success: false,
          message: 'Payment signature verification failed',
        });
      }

      logger.info('Payment signature verified successfully', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified',
      });
    } catch (error: any) {
      logger.error('Error verifying payment', {
        error: error.message,
      });

      return res.status(400).json({
        success: false,
        message: error.message || 'Payment verification failed',
      });
    }
  }

  /**
   * POST /api/assisted/requests
   * 
   * Create assisted service request after successful payment
   * ✅ CRITICAL: Should be called ONLY after payment verification
   * 
   * Request body: { name, phone, city, budget, paymentId, orderId }
   * Response: { success: true, data: { requestId } }
   */
  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone, city, budget, paymentId, orderId, source = 'ASSISTED_UI' } = req.body;

      // ✅ LENIENT VALIDATION: Only require critical fields
      // budget and source are optional
      if (!name || !phone || !city || !paymentId || !orderId) {
        logger.warn('Invalid assisted request payload', {
          name: !!name,
          phone: !!phone,
          city: !!city,
          paymentId: !!paymentId,
          orderId: !!orderId,
        });

        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, phone, city, paymentId, orderId',
        });
      }

      logger.info('Creating assisted request', {
        name,
        phone,
        city,
        paymentId,
        orderId,
        hasBudget: !!budget,
        source,
      });

      // Check if request already exists for this payment
      const existingRequest = await this.repository.findByPaymentId(paymentId);
      if (existingRequest) {
        logger.warn('Duplicate assisted request detected', {
          paymentId,
          existingId: existingRequest.id,
        });

        return res.status(400).json({
          success: false,
          message: 'Request already created for this payment',
        });
      }

      // ✅ Parse budget safely (optional field)
      let parsedBudget: number | undefined = undefined;
      if (budget) {
        const parsed = parseInt(String(budget), 10);
        if (!isNaN(parsed) && parsed > 0) {
          parsedBudget = parsed;
        }
      }

      // Create the assisted request
      const assistedRequest = await this.repository.create({
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        budget: parsedBudget,
        paymentId: paymentId.trim(),
        orderId: orderId.trim(),
      });

      logger.info('Assisted request created successfully', {
        requestId: assistedRequest.id,
        city: assistedRequest.city,
        amount: assistedRequest.amount,
      });

      return res.status(201).json({
        success: true,
        message: 'Assisted request created successfully',
        data: {
          requestId: assistedRequest.id,
          status: assistedRequest.status,
          amount: assistedRequest.amount,
        },
      });
    } catch (error: any) {
      logger.error('Error creating assisted request', {
        error: error.message,
      });

      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create request',
      });
    }
  }
}
