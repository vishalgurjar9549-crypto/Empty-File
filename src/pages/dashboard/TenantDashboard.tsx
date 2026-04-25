

// ─── pages/dashboard/TenantDashboard.tsx ─────────────────────
import { useEffect, useState } from "react";
import { AlertCircle, Clock, Crown, Eye, Home, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCurrentSubscription } from "../../store/slices/subscription.slice";
import { AddPropertyModal } from "../../components/AddPropertyModal";
import { EmailVerificationModal } from "../../components/auth/EmailVerificationModal";
import { showToast } from "../../store/slices/ui.slice";
import { updateUser, getCurrentUser } from "../../store/slices/auth.slice";
import { DashboardShell } from "../../components/dashboard/DashboardShell";
import { SectionCard } from "../../components/dashboard/SectionCard";
import { TenantPlanCard } from "../../components/dashboard/TenantPlanCard";
 
export function TenantDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { current: currentSub, subscriptions } = useAppSelector((s) => s.subscription);
 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const [postVerifyAction, setPostVerifyAction] = useState<null | (() => void)>(null);
  const [isUpgradeConfirmOpen, setIsUpgradeConfirmOpen] = useState(false);
 
  useEffect(() => { dispatch(fetchCurrentSubscription()); }, [dispatch]);
  if (!user) return null;
 
  const primarySubscription = subscriptions.length > 0 ? subscriptions[0] : currentSub;
  const plan = primarySubscription?.plan || "FREE";
  const city = primarySubscription?.city || null;
  const viewCount = currentSub?.viewCount || 0;
  const viewLimit = currentSub?.viewLimit || 10;
  const percentUsed = (viewCount / viewLimit) * 100;
  const expiresAt = primarySubscription?.expiresAt || currentSub?.expiresAt;
 
  const handleEmailVerificationSuccess = () => {
    dispatch(updateUser({ emailVerified: true } as any));
    dispatch(getCurrentUser());
    setIsEmailVerificationOpen(false);
    const action = postVerifyAction; setPostVerifyAction(null); action?.();
  };
 
  return (
    <>
      <AddPropertyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onEmailVerificationRequired={(retry) => { setPostVerifyAction(() => retry); setIsEmailVerificationOpen(true); }} />
      <EmailVerificationModal isOpen={isEmailVerificationOpen} email={user.email} onSuccess={handleEmailVerificationSuccess} onClose={() => { setIsEmailVerificationOpen(false); setPostVerifyAction(null); }} onError={(err) => dispatch(showToast({ message: err, type: "error" }))} />
 
      <DashboardShell title="My Dashboard" subtitle={`Welcome back, ${user.name}`}>
 
        {/* Multiple plans grid */}
        {subscriptions.length > 1 && (
          <div style={{ marginBottom:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <Crown style={{ width:18, height:18, color:'var(--gold)' }} />
              <span className="ds-font-display" style={{ fontSize:20, fontWeight:400 }}>Your Active Plans</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:14 }}>
              {subscriptions.map((sub: any) => <TenantPlanCard key={sub.id || `${sub.plan}-${sub.city}`} sub={sub} />)}
            </div>
          </div>
        )}
 
        {/* Plan card */}
        <SectionCard className="" style={{ marginBottom:24 }}>
          {/* Plan header */}
          <div style={{
            padding:'24px 26px', borderBottom:'1px solid var(--gold-border)',
            background:'linear-gradient(135deg, #0A0C12 0%, #12100A 100%)',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16,
          }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <Crown style={{ width:22, height:22, color:'var(--gold)' }} />
                <span className="ds-font-display" style={{ fontSize:26, fontWeight:400, color:'#F5F4F0' }}>{plan} Plan</span>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', margin:0 }}>
                {city ? `Active in ${city}` : "Browse properties with limited access"}
                {subscriptions.length > 1 ? ` (+${subscriptions.length - 1} more)` : ""}
              </p>
            </div>
            {plan === "FREE" && (
              <Link to="/pricing" style={{ padding:'10px 22px', borderRadius:12, background:'var(--gold)', fontWeight:700, fontSize:13, color:'#000', textDecoration:'none', display:'inline-block' }}>
                Upgrade Now
              </Link>
            )}
          </div>
 
          <div style={{ padding:'22px 26px' }}>
            {plan === "FREE" ? (
              <>
                {/* Progress */}
                <div style={{ marginBottom:22 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13, fontWeight:500 }}>
                    <span style={{ color:'var(--text-secondary)' }}>Property Views</span>
                    <span style={{ fontWeight:700 }}>{viewCount} / {viewLimit}</span>
                  </div>
                  <div style={{ height:6, borderRadius:6, background:'rgba(201,168,76,0.12)', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:6, background:'linear-gradient(90deg, var(--gold), var(--gold-light))', width:`${Math.min(percentUsed, 100)}%`, transition:'width 0.5s ease' }} />
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:6 }}>
                    {viewLimit - viewCount > 0 ? `${viewLimit - viewCount} free views remaining` : "Upgrade to view more properties"}
                  </div>
                </div>
 
                {viewCount >= viewLimit && (
                  <div style={{ background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:14, padding:'14px 16px', marginBottom:20, display:'flex', alignItems:'flex-start', gap:12 }}>
                    <AlertCircle style={{ width:18, height:18, color:'#f97316', flexShrink:0, marginTop:1 }} />
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:'#ea6d07', marginBottom:4 }}>You've reached your free limit</div>
                      <div style={{ fontSize:12, color:'#c45e04' }}>Upgrade to continue viewing properties and unlock owner contact details.</div>
                    </div>
                  </div>
                )}
 
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12 }}>
                  {[
                    { icon:<Eye style={{ width:18, height:18, color:'var(--gold)' }} />, title:`${viewLimit} Free Views`, desc:"First properties only" },
                    { icon:<AlertCircle style={{ width:18, height:18, color:'#f97316' }} />, title:"Limited Contact", desc:"Upgrade to view owner details" },
                    { icon:<Crown style={{ width:18, height:18, color:'var(--gold)' }} />, title:"Upgrade Anytime", desc:"Starting at ₹99/month" },
                  ].map((item, i) => (
                    <div key={i} style={{ padding:'16px', borderRadius:14, border:'1px solid var(--gold-border)', background:'var(--gold-soft)' }}>
                      <div style={{ marginBottom:10 }}>{item.icon}</div>
                      <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{item.title}</div>
                      <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12, marginBottom:16 }}>
                  {[
                    { icon:<Eye style={{ width:18, height:18, color:'var(--gold)' }} />, title:"Unlimited Views", desc:"Browse all properties" },
                    { icon:<Users style={{ width:18, height:18, color:'var(--gold)' }} />, title:"Full Contact Access", desc:"View all owner details" },
                    ...(plan === "PLATINUM" ? [{ icon:<Crown style={{ width:18, height:18, color:'var(--gold)' }} />, title:"Priority Support", desc:"1-to-1 assistance" }] : []),
                  ].map((item, i) => (
                    <div key={i} style={{ padding:16, borderRadius:14, border:'1px solid var(--gold-border)', background:'var(--gold-soft)' }}>
                      <div style={{ marginBottom:10 }}>{item.icon}</div>
                      <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{item.title}</div>
                      <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
                {expiresAt && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', borderRadius:12, border:'1px solid var(--gold-border)', background:'var(--gold-soft)', fontSize:13 }}>
                    <Clock style={{ width:15, height:15, color:'var(--gold)' }} />
                    Plan expires on {new Date(expiresAt).toLocaleDateString()}
                  </div>
                )}
              </>
            )}
          </div>
        </SectionCard>
 
        {/* Quick action cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:16 }}>
          {[
            {
              as:'link', to:'/rooms',
              icon:<Home style={{ width:26, height:26, color:'var(--gold)' }} />,
              title:'Browse Properties',
              desc:`Find your perfect rental in ${user.city || "your city"}`,
              dark: false,
            },
            {
              as:'link', to:'/pricing',
              icon:<Crown style={{ width:26, height:26, color:'var(--gold)' }} />,
              title:'View Plans',
              desc:'Upgrade for unlimited access and premium features',
              dark: true,
            },
            {
              as:'button', onClick:() => setIsUpgradeConfirmOpen(true),
              icon:<Plus style={{ width:26, height:26, color:'var(--gold)' }} />,
              title:'List Your Property',
              desc:'Have a property to rent? Start earning today',
              dark: false,
            },
          ].map((card, i) => {
            const sharedStyle: React.CSSProperties = {
              display:'block', padding:'24px', borderRadius:20, textDecoration:'none', textAlign:'left', width:'100%',
              border:'1px solid var(--gold-border)', cursor:'pointer',
              background: card.dark ? 'linear-gradient(135deg, #0A0C12, #12100A)' : 'var(--surface)',
              boxShadow:'0 2px 20px rgba(0,0,0,0.06)',
              transition:'all 0.2s',
            };
            const inner = (
              <>
                <div style={{ marginBottom:16 }}>{card.icon}</div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:6, color: card.dark ? '#F5F4F0' : 'var(--text-primary)' }}>{card.title}</div>
                <div style={{ fontSize:13, color: card.dark ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)' }}>{card.desc}</div>
              </>
            );
            const hoverIn = (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 12px 36px rgba(201,168,76,0.15)'; };
            const hoverOut = (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.transform='translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow='0 2px 20px rgba(0,0,0,0.06)'; };
            if (card.as === 'link') {
              return <Link key={i} to={(card as any).to} style={sharedStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>{inner}</Link>;
            }
            return <button key={i} onClick={(card as any).onClick} style={sharedStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>{inner}</button>;
          })}
        </div>
 
      </DashboardShell>
    </>
  );
}