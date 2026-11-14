import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';

// Auth & Public Pages
import Login from '@/pages/auth/Login';
import About from '@/pages/About';
import NotFound from '@/pages/404';

// Projects
import Projects from '@/pages/projects/Projects';
import CreateProject from '@/pages/projects/CreateProject';
import EditProject from '@/pages/projects/EditProject';
import ViewProject from '@/pages/projects/ViewProject';
import EditHistory from '@/pages/projects/EditHistory';
import Invitations from '@/pages/projects/Invitations';
import ApproveProjects from '@/pages/projects/ApproveProjects';
import ViewProjectsByDistrict from '@/pages/projects/ViewProjectsByDistrict';
import ViewProjectsByMultiple from '@/pages/projects/ViewProjectsByMultiple';

// Reports
import Reports from '@/pages/reports/Reports';
import CreateReport from '@/pages/reports/CreateReport';
import EditReport from '@/pages/reports/EditReport';
import ViewReport from '@/pages/reports/ViewReport';
import FinancialReport from '@/pages/reports/FinancialReport';
import MembershipReport from '@/pages/reports/MembershipReport';

// Wallet & Finance
import ClubWallet from '@/pages/wallet/ClubWallet';
import AddRecord from '@/pages/wallet/AddRecord';

// Membership
import Members from '@/pages/membership/Members';
import AddMember from '@/pages/membership/AddMember';
import LeoProfile from '@/pages/membership/LeoProfile';

// Settings & Administration
import MyProfile from '@/pages/settings/MyProfile';
import MyClub from '@/pages/settings/MyClub';
import MyDistrict from '@/pages/settings/MyDistrict';
import MyMD from '@/pages/settings/MyMD';
import ProjectCategories from '@/pages/settings/ProjectCategories';

// Help & Documentation
import WorkflowGuide from '@/pages/help/WorkflowGuide';

// Search
import SearchResult from '@/pages/dashboard/SearchResult';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const authenticated = useUserStore((s) => s.authenticated);
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const authenticated = useUserStore((s) => s.authenticated);
  if (authenticated) {
    return <Navigate to="/projects?tab=hosted" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/about-system" element={<About />} />

        {/* Projects */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createProject"
          element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invitations"
          element={
            <ProtectedRoute>
              <Invitations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewProject/projectID=:id"
          element={
            <ProtectedRoute>
              <ViewProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewProject/:id"
          element={
            <ProtectedRoute>
              <ViewProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editProject/projectID=:id/step=:step"
          element={
            <ProtectedRoute>
              <EditProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editProject/:id/:step"
          element={
            <ProtectedRoute>
              <EditProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewEditHistory/projectID=:id/name=:name"
          element={
            <ProtectedRoute>
              <EditHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewEditHistory/:id/:name"
          element={
            <ProtectedRoute>
              <EditHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approve-reports"
          element={
            <ProtectedRoute>
              <ApproveProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-club-reports"
          element={
            <ProtectedRoute>
              <ViewProjectsByDistrict />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared-reports"
          element={
            <ProtectedRoute>
              <ViewProjectsByMultiple />
            </ProtectedRoute>
          }
        />

        {/* Activity & Monthly Reports */}
        <Route
          path="/activityReports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createReport"
          element={
            <ProtectedRoute>
              <CreateReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editReport/reportID=:id"
          element={
            <ProtectedRoute>
              <EditReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editReport/:id"
          element={
            <ProtectedRoute>
              <EditReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewReport/reportID=:id"
          element={
            <ProtectedRoute>
              <ViewReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewReport/:id"
          element={
            <ProtectedRoute>
              <ViewReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewReport/reportID=:id/financialReport/month=:month/cName=:cName"
          element={
            <ProtectedRoute>
              <FinancialReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewReport/:id/financialReport/:month/:cName"
          element={
            <ProtectedRoute>
              <FinancialReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewReport/reportID=:id/membershipReport/month=:month/cName=:cName"
          element={
            <ProtectedRoute>
              <MembershipReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewReport/:id/membershipReport/:month/:cName"
          element={
            <ProtectedRoute>
              <MembershipReport />
            </ProtectedRoute>
          }
        />

        {/* Club Wallet & Ledger */}
        <Route
          path="/club-wallet"
          element={
            <ProtectedRoute>
              <ClubWallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-wallet-record"
          element={
            <ProtectedRoute>
              <AddRecord />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search-record"
          element={
            <ProtectedRoute>
              <ClubWallet />
            </ProtectedRoute>
          }
        />

        {/* Membership */}
        <Route
          path="/membership"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-club-member"
          element={
            <ProtectedRoute>
              <AddMember />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewLeo/userID=:id"
          element={
            <ProtectedRoute>
              <LeoProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewLeo/:id"
          element={
            <ProtectedRoute>
              <LeoProfile />
            </ProtectedRoute>
          }
        />

        {/* Settings & Profiles */}
        <Route
          path="/profile-settings"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/myClubProfile"
          element={
            <ProtectedRoute>
              <MyClub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewClub/Id=:id"
          element={
            <ProtectedRoute>
              <MyClub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewClub/:id"
          element={
            <ProtectedRoute>
              <MyClub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/myDistrictSettings"
          element={
            <ProtectedRoute>
              <MyDistrict />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewDistrict/Id=:id"
          element={
            <ProtectedRoute>
              <MyDistrict />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewDistrict/:id"
          element={
            <ProtectedRoute>
              <MyDistrict />
            </ProtectedRoute>
          }
        />
        <Route
          path="/myMultipleDistrictSettings"
          element={
            <ProtectedRoute>
              <MyMD />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewMultiple"
          element={
            <ProtectedRoute>
              <MyMD />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project-categories"
          element={
            <ProtectedRoute>
              <ProjectCategories />
            </ProtectedRoute>
          }
        />

        {/* Search */}
        <Route
          path="/search/keyword=:keyword"
          element={
            <ProtectedRoute>
              <SearchResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search/:keyword"
          element={
            <ProtectedRoute>
              <SearchResult />
            </ProtectedRoute>
          }
        />

        {/* Workflow & Standards Documentation */}
        <Route
          path="/workflow-guide"
          element={
            <ProtectedRoute>
              <WorkflowGuide />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

