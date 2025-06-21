import Layout from "./Layout.jsx";

import CustomerDashboard from "./CustomerDashboard";

import AdminDashboard from "./AdminDashboard";

import Profile from "./Profile";

import MySubscriptions from "./MySubscriptions";

import FinancialHistory from "./FinancialHistory";

import NewSubscription from "./NewSubscription";

import Customers from "./Customers";

import DeliveryAreas from "./DeliveryAreas";

import TeamManagement from "./TeamManagement";

import AdminReports from "./AdminReports";

import AdminSubscriptions from "./AdminSubscriptions";

import Onboarding from "./Onboarding";

import AdminPlans from "./AdminPlans";

import PaymentHistory from "./PaymentHistory";

import AdminUsers from "./AdminUsers";

import AdminUserDetails from "./AdminUserDetails";

import FinancialManagement from "./FinancialManagement";

import StripeConfiguration from "./StripeConfiguration";

import ProductManagement from "./ProductManagement";

import AdminBusinesses from "./AdminBusinesses";

import BusinessDashboard from "./BusinessDashboard";

import BusinessSettings from "./BusinessSettings";

import CustomerSupport from "./CustomerSupport";

import PlatformReports from "./PlatformReports";

import FAQ from "./FAQ";

import DeliveryManagement from "./DeliveryManagement";

import PriceHistory from "./PriceHistory";

import PlatformInvoices from "./PlatformInvoices";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    CustomerDashboard: CustomerDashboard,
    
    AdminDashboard: AdminDashboard,
    
    Profile: Profile,
    
    MySubscriptions: MySubscriptions,
    
    FinancialHistory: FinancialHistory,
    
    NewSubscription: NewSubscription,
    
    Customers: Customers,
    
    DeliveryAreas: DeliveryAreas,
    
    TeamManagement: TeamManagement,
    
    AdminReports: AdminReports,
    
    AdminSubscriptions: AdminSubscriptions,
    
    Onboarding: Onboarding,
    
    AdminPlans: AdminPlans,
    
    PaymentHistory: PaymentHistory,
    
    AdminUsers: AdminUsers,
    
    AdminUserDetails: AdminUserDetails,
    
    FinancialManagement: FinancialManagement,
    
    StripeConfiguration: StripeConfiguration,
    
    ProductManagement: ProductManagement,
    
    AdminBusinesses: AdminBusinesses,
    
    BusinessDashboard: BusinessDashboard,
    
    BusinessSettings: BusinessSettings,
    
    CustomerSupport: CustomerSupport,
    
    PlatformReports: PlatformReports,
    
    FAQ: FAQ,
    
    DeliveryManagement: DeliveryManagement,
    
    PriceHistory: PriceHistory,
    
    PlatformInvoices: PlatformInvoices,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<CustomerDashboard />} />
                
                
                <Route path="/CustomerDashboard" element={<CustomerDashboard />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/MySubscriptions" element={<MySubscriptions />} />
                
                <Route path="/FinancialHistory" element={<FinancialHistory />} />
                
                <Route path="/NewSubscription" element={<NewSubscription />} />
                
                <Route path="/Customers" element={<Customers />} />
                
                <Route path="/DeliveryAreas" element={<DeliveryAreas />} />
                
                <Route path="/TeamManagement" element={<TeamManagement />} />
                
                <Route path="/AdminReports" element={<AdminReports />} />
                
                <Route path="/AdminSubscriptions" element={<AdminSubscriptions />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/AdminPlans" element={<AdminPlans />} />
                
                <Route path="/PaymentHistory" element={<PaymentHistory />} />
                
                <Route path="/AdminUsers" element={<AdminUsers />} />
                
                <Route path="/AdminUserDetails" element={<AdminUserDetails />} />
                
                <Route path="/FinancialManagement" element={<FinancialManagement />} />
                
                <Route path="/StripeConfiguration" element={<StripeConfiguration />} />
                
                <Route path="/ProductManagement" element={<ProductManagement />} />
                
                <Route path="/AdminBusinesses" element={<AdminBusinesses />} />
                
                <Route path="/BusinessDashboard" element={<BusinessDashboard />} />
                
                <Route path="/BusinessSettings" element={<BusinessSettings />} />
                
                <Route path="/CustomerSupport" element={<CustomerSupport />} />
                
                <Route path="/PlatformReports" element={<PlatformReports />} />
                
                <Route path="/FAQ" element={<FAQ />} />
                
                <Route path="/DeliveryManagement" element={<DeliveryManagement />} />
                
                <Route path="/PriceHistory" element={<PriceHistory />} />
                
                <Route path="/PlatformInvoices" element={<PlatformInvoices />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}