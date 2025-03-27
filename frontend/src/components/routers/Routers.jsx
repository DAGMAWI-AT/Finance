import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Home from "../home/Home";
import App from "../../App";
import UserLayout from "../user/userLayout/UserLayout";
import Dashboard from "../user/dashboard/Dashboard";
import Signin from "../user/auth/signin/Signin";
import SignUp from "../user/auth/signup/Signup";
import WorkReport from "../user/dashboard/reports/WorkReport";
import ViewWorkReport from "../user/dashboard/reports/ViewWorkReport";
import UploadReports from "../user/dashboard/reports/UploadReports";
import UpdateReports from "../user/dashboard/reports/UpdateReports";
//admin
import AdminLayout from "../admin/adminLayout/AdminLayout";
import AdminDashboard from "../admin/adminDashboard/AdminDashboard";
import Category from "../admin/reportCategory/Category";
import ExpireDate from "../admin/expireDate/ExpireDate";
import Csos from "../admin/cso/Csos";
import EachCso from "../admin/cso/each/EachCso";
import Users from "../admin/users/Users";
import UploadCategory from "../admin/reportCategory/UploadCategory";
import EditCategory from "../admin/reportCategory/EditCategory";
import AllCsoReports from "../admin/cso/allCsoReports/AllCsoReports";
import EditProfile from "../admin/profile/EditProfile";
import ViewProfile from "../admin/profile/ViewProfile";
import ChangePassowrd from "../admin/changePassword/ChangePassowrd";
import HeroContent from "../admin/webContent/heroContent/HeroContent";
import UpdateHeroContent from "../admin/webContent/heroContent/UpdateHeroContent";
import ViewHeroContent from "../admin/webContent/heroContent/ViewHeroContent";
import AddHeroContent from "../admin/webContent/heroContent/AddHeroContent";
import News from "../news/News";
import Abouts from "../about/Abouts";
import Meeting from "../admin/webContent/meeting/Meeting";
import AddMeeting from "../admin/webContent/meeting/AddMeeting";
import EditMeeting from "../admin/webContent/meeting/EditMeeting";
import ViewMeeting from "../admin/webContent/meeting/ViewMeeting";
import Contact from "../contact/Contact";
import BlogDetails from "../news/BlogDetails";
import Service from "../service/Service";
import CsoRegister from "../admin/csoRegister/CsoRegister";
import CreateAccount from "../admin/createAccount/CreateAccount";
import PrivateRoute from "../privateRoute/PrivateRoute ";
import EditUserProfile from "../user/profile/EditUserProfile";
import ViewUserProfile from "../user/profile/ViewUserProfile";
import ShowReport from "../admin/cso/reports/ShowReport";
import CSOProfile from "../admin/cso/cosProfile/CSOProfile";
import Unauthorized from "../unauthorized/Unauthorized";
import EditUserPassword from "../user/password/EditUserPassword";
import ForgotPassword from "../user/auth/forgotPassword/ForgotPassword";
import ResetPassword from "../user/auth/resetPassword/ResetPassword";
import CSOLists from "../admin/cso/csoList/CSOLists";
import EditCSO from "../admin/cso/csoList/EditCSO";
import StaffRegister from "../admin/staffRegister/StaffRegister";
import BeneficiaryList from "../admin/beneficiary/BeneficiaryList";
import ViewBeneficiary from "../admin/beneficiary/ViewBeneficiary";
import EditBeneficiary from "../admin/beneficiary/EditBeneficiary";
import AddBeneficiary from "../admin/beneficiary/AddBeneficiary";
import Notifications from "../user/notifications/Notifications";
import Notification from "../admin/notifications/Notifications";
import CreateProjectProposal from "../admin/file/CreateProjectProposal";
import ListProjectProposal from "../admin/file/ListProjectProposal";
import ViewProject from "../admin/file/ViewProject";
import EditProject from "../admin/file/EditProject";
import StaffRegistration from "../admin/auth/StaffRegistration";
import EmailVerification from "../admin/auth/EmailVerification";
import Login from "../admin/auth/Login";
import ForgotPasswordStaff from "../admin/auth/ForgotPassword";
import ResetPasswordStaff from "../admin/auth/ResetPassword";
import LetterManagement from "../letterManagement/LetterManagement";
import SubmissionForm from "../user/form/SubmissionForm";
import FormList from "../user/form/FormList";
// import FormEditor from "../user/form/FormEditor";
import ViewForm from "../admin/form/ViewForm";
import CreateForm from "../admin/form/CreateForm";
import EditForm from "../admin/form/EditForm";
import Forms from "../admin/form/Forms";
import Submitted from "../user/submission/Submitted";
import ViewSubmission from "../user/submission/ViewSubmission";
import AllSubmission from "../admin/cso/csoSubmission/AllSubmission";
import ViewSubmitted from "../admin/cso/csoSubmission/ViewSubmitted";
import CsoSubmission from "../admin/cso/csoSubmission/CsoSubmission";


const Routers = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/news",
        element: <News />,
      },
      {
        path: "/news/blogdetails/:id",
        element: <BlogDetails />,
      },
      {
        path: "/service",
        element: <Service />,
      },
      {
        path: "/about",
        element: <Abouts />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
    ],
  },
  //User Dashboard
  {
    path: "/user",
    element: <PrivateRoute element={<UserLayout />} roleRequired="cso" />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "work_report",
        element: <WorkReport />,
      },
      // {
      //   path: "/user/dashboard/work_report/viewworkreport/:id",
      //   element: <ViewWorkReport />,
      //   loader: async ({ params }) =>
      //     fetch(`${process.env.REACT_APP_API_URL}/api/report/byId/${params.id}`).then((res) =>
      //       res.json()
      //     ),
      // },
      {
        path: "viewworkreport/:id",
        element: <ViewWorkReport />,
      },
      
      {
        path: "unauthorized",
        element: <Unauthorized />,
      },
      {
        path: "upload_report",
        element: <UploadReports />,
      },
      {
        path: "update_report/:id",
        element: <UpdateReports />,
      },
      {
        path: "Edit_user_prifile",
        element: <EditUserProfile />,
      },
      {
        path: "view_user_prifile",
        element: <ViewUserProfile />,
      },
      {
        path: "edit_user_password",
        element: <EditUserPassword />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "form",
        element: <FormList />,
    },
    {
        path: "form/:id",
        element: <SubmissionForm />,
    },
    {
        path: "form/edit/:id",
        element: <EditForm />,
    },
    {
      path: "form/view/:id",
      element: <ViewForm />,
  },
  {
    path: "submitted",
    element: <Submitted />,
},
{
  path: "view_submitted/:id",
  element: <ViewSubmission />,
},

    ],
  },
  // admin dashboard
  {
    path: "/admin",
    // <PrivateRoute><AdminLayout /></PrivateRoute>
    // element: <PrivateRoute roleRequired="admin" element={<AdminLayout />} />,
    element: <PrivateRoute roleRequired={["admin", "sup_admin"]} element={<AdminLayout />} />,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "report_category",
        element: <Category />,
      },
      {
        path: "expire_date",
        element: <ExpireDate />,
      },
      {
        path: "all_cso",
        element: <Csos />,
      },
      {
        path: "each_cso/:id",
        element: <EachCso />,
        // loader: async ({ params }) =>
        //   fetch(`http://localhost:8000/reports/${params.id}`).then(
        //     (res) => res.json()
        //   ),
      },
      {
        path: "show_report/:id",
        element: <ShowReport />,
        loader: async ({ params }) =>
          fetch(`${process.env.REACT_APP_API_URL}/api/report/view/byId/${params.id}`).then(
            (res) => res.json()
          ),
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "report_category/category",
        element: <UploadCategory />,
      },
      {
        path: "report_category/edit_category/:id",
        element: <EditCategory />,
      },
      {
        path: "report_category/all_cso_reports",
        element: <AllCsoReports />,
      },
      {
        path: "edit_profile",
        element: <EditProfile />,
      },
      {
        path: "view_profile",
        element: <ViewProfile />,
      },
      {
        path: "update_password",
        element: <ChangePassowrd />,
      },
      {
        path: "cso_profile/:id",
        element: <CSOProfile />,
        // loader: async ({ params }) =>
        //   fetch(`http://localhost:8000/cso/res/${params.id}`).then(
        //     (res) => res.json()
        //   ),
      },
      {
        path: "web_content/hero_content",
        element: <HeroContent />,
      },
      {
        path: "web_content/update_hero_content",
        element: <UpdateHeroContent />,
      },
      {
        path: "web_content/view_hero_content",
        element: <ViewHeroContent />,
      },
      {
        path: "web_content/add_hero_content",
        element: <AddHeroContent />,
      },
      {
        path: "web_content/meeting_content",
        element: <Meeting />,
      },
      {
        path: "web_content/add_meeting_content",
        element: <AddMeeting />,
      },
      {
        path: "web_content/update_meeting_content",
        element: <EditMeeting />,
      },
      {
        path: "web_content/view_meeting_content",
        element: <ViewMeeting />,
      },
      {
        path: "user_register",
        element: <CsoRegister />,
      },
      {
        path: "staff_register",
        element: <PrivateRoute roleRequired={["sup_admin"]} element={<StaffRegister />} />,
      },
      
      {
        path: "create_userAccount",
        element: <CreateAccount />,
      },
      {
        path: "cso_list",
        element: <CSOLists />,
      },
      {
        path: "cso_edit/:id",
        element: <EditCSO />,
      },

      {
        path: "beneficiary_list",
        element: <BeneficiaryList />,
      },

      {
        path: "view_beneficiary/:id",
        element: <ViewBeneficiary />,
      },
      {
        path: "edit_beneficiary/:id",
        element: <EditBeneficiary />,
      },
      {
        path: "add_beneficiary",
        element: <AddBeneficiary />,
      },
      {
        path: "notifications",
        element: <Notification />,
      },
      {
        path: "project",
        element: <CreateProjectProposal />,
      },
      {
        path: "listPP",
        element: <ListProjectProposal />,
      },
      {
        path: "view/:id",
        element: <ViewProject />,
      },
      {
        path: "edit/:id",
        element: <EditProject />,
      },
      {
        path: "letter",
        element: <LetterManagement />,
      },
      //form
      {
        path: "create_form",
        element: <CreateForm />,
    },
    {
      path: "edit_form/:id",
      element: <EditForm />,
    },
    {
    path: "view_form/:id",
    element: <ViewForm />,
   },
    {
      path: "forms",
      element: <Forms />,
   },
   {
    path: "all_submission",
    element: <AllSubmission />,
 },
 {
  path: "view_submission/:id",
  element: <ViewSubmitted />,
},
{
  path: "cso_submission/:id",
  element: <CsoSubmission />,
},
    ],
  },
  //login rout
  {
    path: "/user/login",
    element: <Signin />,
  },

  {
    path: "forgot_password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  // //register rout
  {
      path: "/staff/register",
      element: <StaffRegistration />,
  },
  {
    path: "/verify/:token",
    element: <EmailVerification />,
},
{
  path: "/login",
  element: <Login />,
},
{
  path: "/forgetPassword",
  element: <ForgotPasswordStaff />,
},
{
  path: "/resetPassword/:token",
  element: <ResetPasswordStaff />,
},
{
  path: "create_userAccount",
  element: <CreateAccount />,
},
]);
export default Routers;
