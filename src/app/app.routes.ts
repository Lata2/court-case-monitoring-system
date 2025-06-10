import { Routes } from '@angular/router';
import { HomepageComponent } from './component/common-component/homepage/homepage.component';
import { OnboardingComponent } from './component/common-component/onboarding/onboarding.component';
import { LoginComponent } from './component/common-component/login/login.component';
import { DashboardComponent } from './component/role-types-components/dashboard-components/dashboard/dashboard.component';
import { DashboardHomeComponent } from './component/role-types-components/dashboard-components/dashboard-home/dashboard-home.component';
import { InboxComponent } from './component/role-types-components/dashboard-components/inbox/inbox.component';
import { CourtOrderComplianceComponent } from './component/role-types-components/dashboard-components/court-order-compliance/court-order-compliance.component';
import { CaseTransferComponent } from './component/role-types-components/dashboard-components/case-transfer/case-transfer.component';
import { HeaderComponent } from './component/common-component/sidebar/sidebar.component';
import { AddNewCasesComponent } from './component/role-types-components/dashboard-components/action/add-new-cases/add-new-cases.component';
import { AllotmentComponent } from './component/role-types-components/dashboard-components/action/allotment/allotment.component';
import { UploadDocumentComponent } from './component/role-types-components/dashboard-components/action/upload-document/upload-document.component';
import { UploadedReportComponent } from './component/role-types-components/dashboard-components/action/uploaded-report/uploaded-report.component';
import { QueryBuilderComponent } from './component/role-types-components/dashboard-components/query/query-builder/query-builder.component';
import { OfficeWiseDashboardComponent } from './component/role-types-components/dashboard-components/query/office-wise-dashboard/office-wise-dashboard.component';
import { UniversityComponent } from './component/role-types-components/dashboard-components/query/university/university.component';
import { CaseNoSearchComponent } from './component/role-types-components/dashboard-components/search/case-no-search/case-no-search.component';
import { AgNoSearchComponent } from './component/role-types-components/dashboard-components/search/ag-no-search/ag-no-search.component';
import { DocumentUploadedComponent } from './component/role-types-components/dashboard-components/report/document-uploaded/document-uploaded.component';
import { ReturnAgNoComponent } from './component/role-types-components/dashboard-components/report/return-ag-no/return-ag-no.component';
import { ActivityComplianceComponent } from './component/role-types-components/dashboard-components/report/activity-compliance/activity-compliance.component';
import { MissReportsComponent } from './component/role-types-components/dashboard-components/report/miss-reports/miss-reports.component';
import { UserDetailsComponent } from './component/role-types-components/dashboard-components/report/user-details/user-details.component';
import { JawabDawaDetailsComponent } from './component/role-types-components/dashboard-components/report/jawab-dawa-details/jawab-dawa-details.component';
import { OicUploadedComponent } from './component/role-types-components/dashboard-components/report/oic-uploaded/oic-uploaded.component';
import { DistrictWiseReportComponent } from './component/role-types-components/dashboard-components/report/district-wise-report/district-wise-report.component';
import { ProfileComponent } from './component/role-types-components/dashboard-components/account/profile/profile.component';
import { AddUserComponent } from './component/role-types-components/dashboard-components/account/add-user/add-user.component';
import { ChangePasswordComponent } from './component/role-types-components/dashboard-components/account/change-password/change-password.component';
import { UpdateProfileComponent } from './component/role-types-components/dashboard-components/account/update-profile/update-profile.component';
import { AIServicesComponent } from './component/role-types-components/dashboard-components/account/ai-services/ai-services.component';
import { MenuControlComponent } from './component/role-types-components/admin-component/menu-control/menu-control.component';
import { SessionComponent } from './component/role-types-components/admin-component/session/session.component';
import { AllotementAllocateDetailsComponent } from './component/role-types-components/dashboard-components/allotement-allocate-details/allotement-allocate-details.component';
import { AllotementCaseListDetailsComponent } from './component/role-types-components/dashboard-components/allotement-case-list-details/allotement-case-list-details.component';
import { UpcomingCauseListComponent } from './component/role-types-components/dashboard-components/upcoming-cause-list/upcoming-cause-list.component';
import { DashboardDetailPageComponent } from './component/role-types-components/dashboard-components/dashboard-detail-page/dashboard-detail-page.component';
import { DynamicTableComponent } from './component/common-component/dynamic-table/dynamic-table.component';
import { LoadingSpinnerComponent } from './component/common-component/loading/loading.component';
import { PerticularCaseDetailComponent } from './component/role-types-components/dashboard-components/perticular-case-detail/perticular-case-detail.component';
import { AgAdvocateDetailsComponent } from './component/role-types-components/ag-component/ag-advocate-details/ag-advocate-details.component';
import { AgDashboardComponent } from './component/role-types-components/ag-component/ag-dashboard/ag-dashboard.component';
import { AgDispatchComponent } from './component/role-types-components/ag-component/ag-dispatch/ag-dispatch.component';
import { AgNewPetitionComponent } from './component/role-types-components/ag-component/ag-new-petition/ag-new-petition.component';
import { AgUpdateCaseNoComponent } from './component/role-types-components/ag-component/ag-update-case-no/ag-update-case-no.component';
import { AgUploadDispatchComponent } from './component/role-types-components/ag-component/ag-upload-dispatch/ag-upload-dispatch.component';
import { AgUpdateComponent } from './component/role-types-components/ag-component/ag-update/ag-update.component';
import { UploadDocAgnoComponent } from './component/role-types-components/ag-component/Upload-Documents/upload-doc-agno/upload-doc-agno.component';
import { UploadDocCasenoComponent } from './component/role-types-components/ag-component/Upload-Documents/upload-doc-caseno/upload-doc-caseno.component';


export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'login', component: LoginComponent },
  // { path: 'dynamic_table', component: DynamicTableComponent },
  { path: 'loading', component: LoadingSpinnerComponent },



  {
    path: 'header',
    component: HeaderComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'dashboard_home', component: DashboardHomeComponent },
      { path: 'dashboard_inbox', component: InboxComponent },
      { path: 'dashboard_court_order_compliance', component: CourtOrderComplianceComponent },
      { path: 'dashboard_case_transfer', component: CaseTransferComponent },
      // Dashboard Action Module
      { path: 'dashboard_action/allotment', component: AllotmentComponent },
      { path: 'dashboard_action/upload_documents', component: UploadDocumentComponent },
      { path: 'dashboard_action/upload_report', component: UploadedReportComponent },
      // { path: 'dashboard_action/upload_report2', component: DummyComponent },
      { path: 'dashboard_action/add_new_case', component: AddNewCasesComponent },

      // Dashboard Query Module
      { path: 'dashboard_query/query_builder', component: QueryBuilderComponent },
      { path: 'dashboard_query/upload_office_wise_dashboard', component: OfficeWiseDashboardComponent },
      { path: 'dashboard_query/upload_university', component: UniversityComponent },

      { path: 'allotement_case_list_details', component: AllotementCaseListDetailsComponent },
      { path: 'upcoming_cause_list/:date', component: UpcomingCauseListComponent },
      { path: 'dashboard_detail_page', component: DashboardDetailPageComponent },

      // Dashboard Search Module
      { path: 'dashboard_search/case_no_search', component: CaseNoSearchComponent },
      { path: 'dashboard_search/ag_no_search', component: AgNoSearchComponent },

      // Dashboard Report Module
      { path: 'dashboard_report/document_uploaded', component: DocumentUploadedComponent },
      { path: 'dashboard_report/forworded_ag_no', component: ReturnAgNoComponent },
      { path: 'dashboard_report/activity_compliance', component: ActivityComplianceComponent },
      { path: 'dashboard_report/mis_report', component: MissReportsComponent },
      { path: 'dashboard_report/user_details', component: UserDetailsComponent },
      { path: 'dashboard_report/jawab_dawa_details', component: JawabDawaDetailsComponent },
      // { path: 'dashboard_report/app_download_user_detail', component: DummyComponent },
      { path: 'dashboard_report/oic_upload', component: OicUploadedComponent },
      // { path: 'dashboard_report/today_login', component: DummyComponent },
      { path: 'dashboard_report/district_wise_report', component: DistrictWiseReportComponent },
      { path: 'allotement_allocate_details/:cnrNo', component: AllotementAllocateDetailsComponent },

      // Dashboard Account Module
      { path: 'dashboard_account/profile', component: ProfileComponent },
      { path: 'dashboard_account/add_user', component: AddUserComponent },
      { path: 'dashboard_account/change_password', component: ChangePasswordComponent },
      { path: 'dashboard_account/update_profile', component: UpdateProfileComponent },
      { path: 'dashboard_account/AI_services', component: AIServicesComponent },

      // 
      { path: 'session', component: SessionComponent },
      { path: 'menu-control', component: MenuControlComponent },

      { path: 'perticular-case-datail/:cino', component: PerticularCaseDetailComponent },

      { path: 'ag_advocate_details', component: AgAdvocateDetailsComponent },
      { path: 'ag_dashboard', component: AgDashboardComponent },
      { path: 'ag_dispatch', component: AgDispatchComponent },
      { path: 'ag_new_petition', component: AgNewPetitionComponent },
      { path: 'ag_update_case_no', component: AgUpdateCaseNoComponent },
      { path: 'ag_update', component: AgUpdateComponent },
      { path: 'ag_upload_dispatch', component: AgUploadDispatchComponent },

     { path: 'upload_doc_agno', component: UploadDocAgnoComponent },
     { path: 'upload_doc_caseno', component: UploadDocCasenoComponent },


      // { path: 'dashboard_report/advocate_details', component: AdvocateDetailsComponent },



      // Help Module
      // { path: 'dashboard_help/user_manuals', component: DummyComponent },
      // { path: 'dashboard_help/tutorials', component: DummyComponent },
    ]

  }
];





