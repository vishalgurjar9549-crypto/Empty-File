import React, { useEffect, useState, createContext, useContext } from 'react'
import {
  rooms as initialRooms,
  cities,
  initialOwners,
  initialBookings,
} from '../data/dummyData'
// Types
export interface Room {
  id: string
  title: string
  description: string
  cityId: string
  location: string
  landmark: string
  pricePerMonth: number
  roomType: 'Single' | 'Shared' | 'PG' | '1BHK' | '2BHK'
  forWhom: 'Students' | 'Working Professionals' | 'Family'
  amenities: string[]
  rating: number
  reviewsCount: number
  images: string[]
  isPopular: boolean
  isVerified: boolean
  ownerId: string
  isActive: boolean
}
export interface Owner {
  id: string
  name: string
  email: string
  password: string
  phone: string
  city: string
  createdAt: string
}
export interface Booking {
  id: string
  roomId: string
  ownerId: string
  tenantName: string
  tenantEmail: string
  tenantPhone: string
  moveInDate: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}
export interface User {
  id: string
  name: string
  email: string
  role: 'owner' | 'tenant'
  phone?: string
  city?: string
}
interface AppContextType {
  rooms: Room[]
  owners: Owner[]
  bookings: Booking[]
  currentUser: User | null
  addRoom: (
    room: Omit<Room, 'id' | 'rating' | 'reviewsCount' | 'isActive'>,
  ) => void
  updateRoom: (id: string, updates: Partial<Room>) => void
  deleteRoom: (id: string) => void
  toggleRoomStatus: (id: string) => void
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void
  updateBooking: (id: string, updates: Partial<Booking>) => void
  login: (email: string, password: string) => boolean
  register: (
    user: Omit<Owner, 'id' | 'createdAt'> & {
      role: 'owner' | 'tenant'
    },
  ) => void
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  showToast: (message: string, type: 'success' | 'error') => void
  toast: {
    message: string
    type: 'success' | 'error'
  } | null
}
const AppContext = createContext<AppContextType | undefined>(undefined)
// Initial dummy data
const initialOwners: Owner[] = [
  {
    id: 'user-1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    password: 'password123',
    phone: '+91 98765 43210',
    city: 'jaipur',
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'user-3',
    name: 'Amit Patel',
    email: 'amit@example.com',
    password: 'password123',
    phone: '+91 98765 43212',
    city: 'mumbai',
    createdAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'user-5',
    name: 'Suresh Yadav',
    email: 'suresh@example.com',
    password: 'password123',
    phone: '+91 98765 43214',
    city: 'jaipur',
    createdAt: new Date('2024-02-10').toISOString(),
  },
  {
    id: 'user-8',
    name: 'Pooja Agarwal',
    email: 'pooja@example.com',
    password: 'password123',
    phone: '+91 98765 43217',
    city: 'delhi',
    createdAt: new Date('2024-02-18').toISOString(),
  },
  {
    id: 'user-11',
    name: 'Manoj Chauhan',
    email: 'manoj@example.com',
    password: 'password123',
    phone: '+91 98765 43220',
    city: 'bangalore',
    createdAt: new Date('2024-03-01').toISOString(),
  },
];

const initialBookings: Booking[] = [
  {
    id: 'booking1',
    roomId: '1',
    ownerId: 'owner1',
    tenantName: 'Sneha Reddy',
    tenantEmail: 'sneha@example.com',
    tenantPhone: '+91 98765 11111',
    moveInDate: '2024-02-01',
    message: 'Looking for immediate Visit-in. Can we schedule a visit?',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'booking2',
    roomId: '2',
    ownerId: 'owner1',
    tenantName: 'Arjun Mehta',
    tenantEmail: 'arjun@example.com',
    tenantPhone: '+91 98765 22222',
    moveInDate: '2024-02-15',
    message: 'Interested in this property. Please share more details.',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'booking3',
    roomId: '4',
    ownerId: 'owner2',
    tenantName: 'Kavya Singh',
    tenantEmail: 'kavya@example.com',
    tenantPhone: '+91 98765 33333',
    moveInDate: '2024-03-01',
    message: 'Would like to visit this weekend.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
export function AppProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  // Initialize from localStorage or use defaults
  useEffect(() => {
    const storedRooms = localStorage.getItem('kangaroo_rooms')
    const storedOwners = localStorage.getItem('kangaroo_owners')
    const storedBookings = localStorage.getItem('kangaroo_bookings')
    const storedUser = localStorage.getItem('kangaroo_user')
    setRooms(
      storedRooms
        ? JSON.parse(storedRooms)
        : initialRooms.map((r) => ({
            ...r,
            isActive: true,
          })),
    )
    setOwners(storedOwners ? JSON.parse(storedOwners) : initialOwners)
    setBookings(storedBookings ? JSON.parse(storedBookings) : initialBookings)
    setCurrentUser(storedUser ? JSON.parse(storedUser) : null)
  }, [])
  // Sync to localStorage whenever data changes
  useEffect(() => {
    if (rooms.length > 0)
      localStorage.setItem('kangaroo_rooms', JSON.stringify(rooms))
  }, [rooms])
  useEffect(() => {
    if (owners.length > 0)
      localStorage.setItem('kangaroo_owners', JSON.stringify(owners))
  }, [owners])
  useEffect(() => {
    if (bookings.length > 0)
      localStorage.setItem('kangaroo_bookings', JSON.stringify(bookings))
  }, [bookings])
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kangaroo_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('kangaroo_user')
    }
  }, [currentUser])
  // Toast system
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({
      message,
      type,
    })
    setTimeout(() => setToast(null), 3000)
  }
  // Room CRUD
  const addRoom = (
    room: Omit<Room, 'id' | 'rating' | 'reviewsCount' | 'isActive'>,
  ) => {
    const newRoom: Room = {
      ...room,
      id: `room_${Date.now()}`,
      rating: 0,
      reviewsCount: 0,
      isActive: true,
    }
    setRooms((prev) => [...prev, newRoom])
    showToast('Property added successfully!', 'success')
  }
  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id
          ? {
              ...room,
              ...updates,
            }
          : room,
      ),
    )
    showToast('Property updated successfully!', 'success')
  }
  const deleteRoom = (id: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== id))
    showToast('Property deleted successfully!', 'success')
  }
  const toggleRoomStatus = (id: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id
          ? {
              ...room,
              isActive: !room.isActive,
            }
          : room,
      ),
    )
  }
  // Booking CRUD
  const addBooking = (
    booking: Omit<Booking, 'id' | 'createdAt' | 'status'>,
  ) => {
    const newBooking: Booking = {
      ...booking,
      id: `booking_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    setBookings((prev) => [...prev, newBooking])
    showToast('Booking request sent successfully!', 'success')
  }
  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              ...updates,
            }
          : booking,
      ),
    )
    showToast('Booking updated successfully!', 'success')
  }
  // Auth
  const login = (email: string, password: string): boolean => {
    const owner = owners.find(
      (o) => o.email === email && o.password === password,
    )
    if (owner) {
      setCurrentUser({
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: 'owner',
        phone: owner.phone,
        city: owner.city,
      })
      showToast(`Welcome back, ${owner.name}!`, 'success')
      return true
    }
    showToast('Invalid email or password', 'error')
    return false
  }
  const register = (
    userData: Omit<Owner, 'id' | 'createdAt'> & {
      role: 'owner' | 'tenant'
    },
  ) => {
    const newUser: Owner = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      city: userData.city || '',
      createdAt: new Date().toISOString(),
    }
    setOwners((prev) => [...prev, newUser])
    setCurrentUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: userData.role,
      phone: newUser.phone,
      city: newUser.city,
    })
    showToast(
      `Account created successfully! Welcome, ${newUser.name}!`,
      'success',
    )
  }
  const logout = () => {
    setCurrentUser(null)
    showToast('Logged out successfully', 'success')
  }
  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return
    const updatedUser = {
      ...currentUser,
      ...updates,
    }
    setCurrentUser(updatedUser)
    // Update in owners array
    setOwners((prev) =>
      prev.map((owner) =>
        owner.id === currentUser.id
          ? {
              ...owner,
              name: updatedUser.name,
              phone: updatedUser.phone || '',
              city: updatedUser.city || '',
            }
          : owner,
      ),
    )
    showToast('Profile updated successfully!', 'success')
  }
  return (
    <AppContext.Provider
      value={{
        rooms,
        owners,
        bookings,
        currentUser,
        addRoom,
        updateRoom,
        deleteRoom,
        toggleRoomStatus,
        addBooking,
        updateBooking,
        login,
        register,
        logout,
        updateProfile,
        showToast,
        toast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
