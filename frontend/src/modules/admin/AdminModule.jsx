import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Taxi Admin Pages
import AllBookings from './pages/taxi/AllBookings';
import CarCategories from './pages/taxi/CarCategories';
import Customers from './pages/taxi/Customers';
import BasePrices from './pages/taxi/BasePrices';
import VehicleAttachments from './pages/taxi/VehicleAttachments';
import Drivers from './pages/taxi/Drivers';
import SettlementManagement from './pages/SettlementManagement';
import Attendance from './pages/taxi/Attendance';
import Staff from './pages/taxi/Staff';
import StaffReports from './pages/taxi/StaffReports';
import Keywords from './pages/taxi/Keywords';
import Business from './pages/taxi/Business';
import EmailTemplates from './pages/taxi/EmailTemplates';
import Settings from './pages/taxi/Settings';
import FinanceReconciliation from './pages/FinanceReconciliation';
import SupportManagement from './pages/SupportManagement';
import AlertManagement from './pages/AlertManagement';

// Additional Pages
import CouponListPage from './pages/CouponListPage';
import DiscountCouponPage from './pages/DiscountCouponPage';
import CouponFormPage from './pages/CouponFormPage';
import BlogManagement from './pages/BlogManagement';
import AirportManagement from './pages/taxi/AirportManagement';
import SearchHistoryPage from './pages/taxi/SearchHistoryPage';
import PlaceholderPage from './pages/PlaceholderPage';

function AdminModule() {
    return (
        <Routes>
            {/* Public Admin Routes */}
            <Route path="login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                
                {/* Taxi Specific Routes */}
                <Route path="bookings/*" element={<AllBookings />} />
                <Route path="car-category/*" element={<CarCategories />} />
                <Route path="customers/*" element={<Customers />} />
                <Route path="prices/*" element={<BasePrices />} />
                <Route path="vehicle-attachments/*" element={<VehicleAttachments />} />
                <Route path="drivers/*" element={<Drivers />} />
                <Route path="settlements" element={<SettlementManagement />} />
                <Route path="reconciliation" element={<FinanceReconciliation />} />
                <Route path="support" element={<SupportManagement />} />
                <Route path="alerts" element={<AlertManagement />} />
                <Route path="attendance/*" element={<Attendance />} />
                <Route path="staff/*" element={<Staff />} />
                <Route path="staff-reports/*" element={<StaffReports />} />
                <Route path="keywords/*" element={<Keywords />} />
                <Route path="business/*" element={<Business />} />
                <Route path="email-templates/*" element={<EmailTemplates />} />
                <Route path="settings/*" element={<Settings />} />

                {/* Additional Sidebar Routes */}
                <Route path="coupons/list" element={<CouponListPage />} />
                <Route path="coupons/discounts" element={<DiscountCouponPage />} />
                <Route path="coupons/add" element={<CouponFormPage />} />
                <Route path="coupons/edit/:id" element={<CouponFormPage />} />
                <Route path="coupons/*" element={<PlaceholderPage />} />
                <Route path="posts" element={<BlogManagement />} />
                <Route path="posts/nammataxi" element={<BlogManagement defaultCategory="NAMMATAXI" />} />
                <Route path="posts/airport-taxi" element={<BlogManagement defaultCategory="AIRPORTTAXISERVICE" />} />
                <Route path="posts/*" element={<BlogManagement />} />
                <Route path="bangalore-taxi/keywords" element={<Keywords />} />
                <Route path="bangalore-taxi/posts" element={<BlogManagement defaultCategory="AIRPORTTAXISERVICE" />} />
                <Route path="bangalore-taxi/distances" element={<AirportManagement defaultTab="DISTANCE" />} />
                <Route path="bangalore-taxi/contacts" element={<AirportManagement defaultTab="CONTACT" />} />
                <Route path="bangalore-taxi/routes" element={<AirportManagement defaultTab="ROUTE" />} />
                <Route path="bangalore-taxi/*" element={<AirportManagement />} />
                <Route path="search-histories/nammataxi" element={<SearchHistoryPage defaultCategory="NAMMATAXI" />} />
                <Route path="search-histories/bangalore-airport" element={<SearchHistoryPage defaultCategory="BANGALORE_AIRPORT" />} />
                <Route path="search-histories/*" element={<SearchHistoryPage />} />

                {/* Default Fallback Route */}
                <Route path="*" element={<DashboardPage />} />
            </Route>
        </Routes>
    );
}

export default AdminModule;
