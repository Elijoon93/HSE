/**
 * SafetyManage Mobile — Portfolio Gateway v4.1
 * Standalone Apps Script. Google Sheet remains private.
 * Public users interact only with a limited Web App API.
 */

const APP_VERSION = '4.1.0';

const CONFIG = Object.freeze({
  SPREADSHEET_ID: '1nrAxgNFCiEO7c1mTYVojfbTJ5-Z5Ewigshw5bcECahU',
  DEFAULT_HOLDING_CODE: 'FYH',
  SESSION_DAYS: 365,
  DEDICATED_ADMIN_MAX_FAILURES: 5,
  DEDICATED_ADMIN_LOCK_MINUTES: 30
});

const SHEETS = Object.freeze({
  ORGANIZATIONS: 'Organizations',
  SITES: 'Sites',
  UNITS: 'Units',
  USERS: 'Users',
  ROLES: 'Roles',
  ACCESS_REQUESTS: 'AccessRequests',
  ACTIVATION_CODES: 'ActivationCodes',
  SESSIONS: 'Sessions',
  AUDIT_LOG: 'AuditLog',
  RECORDS: 'Records',
  ACTIONS: 'Actions',
  CHECKLIST_TEMPLATES: 'ChecklistTemplates',
  CHECKLIST_ITEMS: 'ChecklistItems',
  INSPECTION_RUNS: 'InspectionRuns',
  INSPECTION_RESPONSES: 'InspectionResponses',
  RISK_ASSESSMENTS: 'RiskAssessments',
  PERMITS: 'Permits',
  INCIDENTS: 'Incidents',
  DAILY_REPORTS: 'DailyReports',
  BRAND_PROFILES: 'BrandProfiles',
  ORGANIZATION_MODULES: 'OrganizationModules',
  DATA_PARTITIONS: 'DataPartitions',
  PORTFOLIO_DASHBOARD: 'PortfolioDashboard',
  GLOBAL_ADMINS: 'GlobalAdmins'
});

const HEADERS = Object.freeze({
  Organizations: ['HoldingCode','HoldingName','LegalEntityCode','LegalEntityName','OrganizationCode','OrganizationName','OrganizationShortName','OrganizationType','OperatingModel','Commodity','LifecycleStage','ParentOrganizationCode','Province','City','DataSpreadsheetId','BrandProfileCode','Active','DisplayOrder','Notes','SourceURL','NeedsReview','HoldingBrandProfileCode','OperatingBrandProfileCode','BrandLockPolicy'],
  Sites: ['SiteCode','SiteName','OrganizationCode','SiteType','LifecycleStage','Province','City','Active','DisplayOrder','DataPartitionCode','Notes','SourceURL'],
  Units: ['UnitCode','UnitName','SiteName','ManagerName','HSEContact','Active','OrganizationCode','SiteCode','UnitType','ProfileCode','ModuleScope','DataPartitionCode'],
  Users: ['UserCode','FullName','Role','UnitCode','UnitName','Mobile','Active','PersonnelNumber','JobTitle','OrganizationCode','SiteCode','SystemRole','AccountStatus','AccessTokenHash','DeviceID','ApprovedBy','ApprovedAt','LastLoginAt'],
  Roles: ['RoleCode','RoleNameFA','ScopeLevel','CanRegister','CanViewOwn','CanViewUnit','CanApprove','CanAdmin','CanUseActivationCode','Active'],
  AccessRequests: ['RequestID','SubmittedAt','FullName','PersonnelNumber','Mobile','Email','HoldingCode','OrganizationCode','SiteCode','UnitCode','JobTitle','RequestedRole','DeviceID','RequestSecretHash','RequestStatus','ApprovedRole','IsApproved','IsActive','ApprovedBy','ApprovedAt','ActivatedAt','RejectionReason','AccessTokenHash','LastStatusCheckAt'],
  ActivationCodes: ['CodeLabel','CodeHash','OrganizationCode','SiteCode','UnitCode','AssignedRole','UnlimitedUse','MaxUses','UseCount','IsActive','ExpiresAt','LastUsedBy','LastUsedAt','CreatedBy','Notes'],
  Sessions: ['SessionID','UserCode','TokenHash','DeviceID','CreatedAt','LastSeenAt','ExpiresAt','Revoked','RevokeReason'],
  AuditLog: ['EventID','EventAt','ActorUserCode','ActorRole','EventType','EntityType','EntityID','OrganizationCode','SiteCode','UnitCode','DeviceID','Result','Details','AppVersion'],
  Records: ['RecordID','SubmittedAtISO','SubmittedAtJalali','UnitCode','UnitName','Site','Shift','ReporterName','ReporterRole','RecordType','RecordSubtype','Title','Description','Location','RiskLevel','Severity','Status','WorkStopped','ImmediateAction','ActionRequired','ActionOwner','DueDate','Latitude','Longitude','PhotoCount','DeviceID','AppVersion','SyncSource','LastUpdatedAt','HoldingCode','OrganizationCode','SiteCode','UserCode','SystemRole'],
  Actions: ['ActionID','SourceRecordID','UnitCode','UnitName','ActionTitle','ActionDescription','Owner','DueDate','Priority','Status','VerificationMethod','ClosedAt','VerifiedBy','HoldingCode','OrganizationCode','SiteCode','UserCode','SystemRole'],
  ChecklistTemplates: ['TemplateCode','TemplateName','ScopeType','OrganizationType','ActivityType','Version','IsActive','RequiredPhotoOnNC','CriticalFailStopsWork','CreatedBy','UpdatedAt','Notes'],
  ChecklistItems: ['ItemCode','TemplateCode','DisplayOrder','SectionName','ItemText','ResponseType','IsCritical','RequireEvidenceOnNo','ApplicableToMining','ApplicableToFactory','DefaultRiskLevel','ReferenceCode','IsActive','UpdatedAt','Notes'],
  InspectionRuns: ['InspectionID','SubmittedAtISO','SubmittedAtJalali','HoldingCode','OrganizationCode','SiteCode','UnitCode','UserCode','SystemRole','TemplateCode','InspectionType','Location','Shift','OverallStatus','CompliancePercent','CriticalFailures','NonConformities','WorkStopped','Summary','ActionRequired','SyncSource','DeviceID','AppVersion','LastUpdatedAt'],
  InspectionResponses: ['ResponseID','InspectionID','ItemCode','SectionName','ItemText','Response','IsCritical','EvidenceRequired','Note','PhotoCount','RiskLevel','ActionRequired','ActionOwner','DueDate','OrganizationCode','SiteCode','UnitCode','UserCode'],
  RiskAssessments: ['RiskAssessmentID','SubmittedAtISO','HoldingCode','OrganizationCode','SiteCode','UnitCode','UserCode','SystemRole','Method','Activity','Hazard','Consequence','ExposedPersons','ExistingControls','InitialLikelihood','InitialSeverity','InitialScore','InitialLevel','AdditionalControls','ResidualLikelihood','ResidualSeverity','ResidualScore','ResidualLevel','WorkDecision','ActionOwner','DueDate','Status','LastUpdatedAt'],
  Permits: ['PermitID','SubmittedAtISO','HoldingCode','OrganizationCode','SiteCode','UnitCode','UserCode','SystemRole','PermitType','JobTitle','JobDescription','Location','Requester','ResponsibleSupervisor','StartAt','EndAt','Hazards','Controls','IsolationRequired','LOTOConfirmed','GasTestRequired','GasTestResult','PPE','EmergencyControls','AuthorizationStatus','IssuedBy','ClosedBy','ClosedAt','DeviceID','LastUpdatedAt'],
  Incidents: ['IncidentID','SubmittedAtISO','HoldingCode','OrganizationCode','SiteCode','UnitCode','UserCode','SystemRole','EventType','EventDateTime','Location','Description','ActualSeverity','PotentialSeverity','InjuryOccurred','InjuredPerson','LostTime','AssetDamage','EnvironmentalImpact','ImmediateActions','AreaSecured','NotificationStatus','DirectCause','RootCause','InvestigationStatus','ActionRequired','ReportedBy','DeviceID','AppVersion','LastUpdatedAt'],
  DailyReports: ['DailyReportID','ReportDate','SubmittedAtISO','HoldingCode','OrganizationCode','SiteCode','UnitCode','UserCode','SystemRole','Shift','Headcount','WorkHours','InspectionsCount','UnsafeConditionsCount','ToolboxCount','PermitsActive','IncidentsCount','NearMissCount','OpenActions','CriticalRisks','EquipmentDefects','EnvironmentalEvents','TrainingHours','KeyActivities','KeyFindings','HSESummary','SupervisorName','LastUpdatedAt'],
  BrandProfiles: ['ProfileCode','DisplayName','LegalName','ShortName','WebsiteURL','LogoURL','HeroImageURL','PrimaryColor','AccentColor','TextColor','UseOfficialBrand','Active','Notes','BrandLevel','ParentProfileCode','BrandLocked','LockedBy','LockedAt'],
  OrganizationModules: ['OrganizationCode','SiteCode','ModuleCode','ModuleNameFA','Enabled','Priority','TemplateSet','ScopeType','Notes'],
  DataPartitions: ['PartitionCode','OrganizationCode','SpreadsheetId','SpreadsheetURL','RoutingMode','IsIndependentLegalEntity','Active','LastInitializedAt','Notes'],
  GlobalAdmins: ['AdminCode','FullName','AdminLevel','SystemRole','PortfolioScope','ApprovalAuthority','CanManageUsers','CanManageOrganizations','CanManageDataPartitions','AccountBindingStatus','Active','Notes','DedicatedKeySalt','DedicatedKeyHash','KeyBoundRequestID','KeyBoundDeviceID','KeyUsePolicy','FailedAttempts','LockedUntil','KeyConfiguredAt','KeyLastUsedAt']
});

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'health');
  try {
    if (action === 'health') {
      return json_({ok:true, service:'SafetyManage Access Gateway', version:APP_VERSION});
    }
    if (action === 'publicBootstrap') return json_(publicBootstrap_());
    return json_({ok:false,error:'Unsupported GET action'});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    const action = String(body.action || '');
    let result;
    switch (action) {
      case 'health':
        result = {ok:true,service:'SafetyManage Access Gateway',version:APP_VERSION};
        break;
      case 'publicBootstrap':
        result = publicBootstrap_();
        break;
      case 'requestAccess':
        result = requestAccess_(body.request || {});
        break;
      case 'requestStatus':
        result = requestStatus_(body);
        break;
      case 'activateWithCode':
        result = activateWithCode_(body);
        break;
      case 'activateDedicatedAdmin':
        result = activateDedicatedAdmin_(body);
        break;
      case 'sessionProfile':
        result = sessionProfile_(body);
        break;
      case 'portfolioSummary':
        result = portfolioSummary_(body);
        break;
      case 'submitRecord':
        result = submitRecord_(body);
        break;
      case 'submitAction':
        result = submitAction_(body);
        break;
      case 'submitInspection':
        result = submitInspection_(body);
        break;
      case 'submitRiskAssessment':
        result = submitRiskAssessment_(body);
        break;
      case 'submitPermit':
        result = submitPermit_(body);
        break;
      case 'submitIncident':
        result = submitIncident_(body);
        break;
      case 'submitDailyReport':
        result = submitDailyReport_(body);
        break;
      default:
        throw new Error('Unsupported action');
    }
    return json_(result);
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function initializePlatform() {
  initializePortfolioArchitecture();
}

function initializePortfolioArchitecture() {
  const control = ss_();
  const controlSheets = [
    'Organizations','Sites','Units','Users','Roles','AccessRequests','ActivationCodes',
    'Sessions','AuditLog','BrandProfiles','OrganizationModules','DataPartitions',
    'ChecklistTemplates','ChecklistItems','GlobalAdmins'
  ];
  controlSheets.forEach(function(name) {
    ensureHeaders_(getOrCreateSheet_(control, name), HEADERS[name]);
    styleHeader_(control.getSheetByName(name), HEADERS[name].length);
  });

  seedOperationalCore_();
  seedPortfolioTemplateCatalog_();

  const partitions = activeObjects_(SHEETS.DATA_PARTITIONS);
  const results = [];
  partitions.forEach(function(partition, index) {
    const child = SpreadsheetApp.openById(String(partition.SpreadsheetId));
    ensureChildWorkbook_(child, partition);
    const rowNumber = findRowNumber_(SHEETS.DATA_PARTITIONS, 'PartitionCode', partition.PartitionCode);
    if (rowNumber) {
      updateObjectAtRow_(SHEETS.DATA_PARTITIONS, rowNumber, {
        LastInitializedAt:new Date().toISOString()
      });
    }
    results.push({
      partitionCode:String(partition.PartitionCode),
      organizationCode:String(partition.OrganizationCode),
      spreadsheetId:child.getId(),
      spreadsheetName:child.getName()
    });
  });

  console.log(JSON.stringify({
    ok:true,
    version:APP_VERSION,
    controlSpreadsheetId:control.getId(),
    initializedPartitions:results
  }));
  return results;
}

function publicBootstrap_() {
  return {
    ok:true,
    version:APP_VERSION,
    organizations:publicOrganizations_(),
    sites:publicSites_(),
    units:publicUnits_(),
    roles:activeObjects_(SHEETS.ROLES).filter(function(r) {
      return ['Reporter','Inspector','Supervisor'].indexOf(String(r.RoleCode)) >= 0;
    }),
    checklistTemplates:activeObjects_(SHEETS.CHECKLIST_TEMPLATES).map(sanitizeChecklistTemplate_),
    checklistItems:activeObjects_(SHEETS.CHECKLIST_ITEMS).map(sanitizeChecklistItem_),
    brandProfiles:publicBrandProfiles_(),
    organizationModules:publicOrganizationModules_()
  };
}

function requestAccess_(request) {
  ['fullName','mobile','organizationCode','siteCode','unitCode','jobTitle','requestedRole','deviceId']
    .forEach(function(key) {
      if (!clean_(request[key], 200)) throw new Error('Required field missing: ' + key);
    });

  const organization = findObject_(SHEETS.ORGANIZATIONS, 'OrganizationCode', request.organizationCode);
  const site = findObject_(SHEETS.SITES, 'SiteCode', request.siteCode);
  const unit = findObject_(SHEETS.UNITS, 'UnitCode', request.unitCode);
  const role = findObject_(SHEETS.ROLES, 'RoleCode', request.requestedRole);

  if (!organization || !isTrue_(organization.Active)) throw new Error('Organization is not active');
  if (!site || !isTrue_(site.Active) || String(site.OrganizationCode) !== String(organization.OrganizationCode)) throw new Error('Invalid site');
  if (!unit || !isTrue_(unit.Active) || String(unit.OrganizationCode) !== String(organization.OrganizationCode)) throw new Error('Invalid unit');
  if (!role || !isTrue_(role.Active) || ['Reporter','Inspector','Supervisor'].indexOf(String(role.RoleCode)) < 0) throw new Error('Requested role is not allowed');

  const requestId = id_('REQ');
  const requestSecret = token_('RQ');
  const now = new Date().toISOString();

  appendObject_(SHEETS.ACCESS_REQUESTS, {
    RequestID: requestId,
    SubmittedAt: now,
    FullName: clean_(request.fullName, 160),
    PersonnelNumber: clean_(request.personnelNumber, 80),
    Mobile: clean_(request.mobile, 40),
    Email: clean_(request.email, 160),
    HoldingCode: clean_(request.holdingCode, 40) || CONFIG.DEFAULT_HOLDING_CODE,
    OrganizationCode: organization.OrganizationCode,
    SiteCode: site.SiteCode,
    UnitCode: unit.UnitCode,
    JobTitle: clean_(request.jobTitle, 160),
    RequestedRole: role.RoleCode,
    DeviceID: clean_(request.deviceId, 100),
    RequestSecretHash: hash_(requestSecret),
    RequestStatus: 'Pending',
    ApprovedRole: '',
    IsApproved: false,
    IsActive: false,
    ApprovedBy: '',
    ApprovedAt: '',
    ActivatedAt: '',
    RejectionReason: '',
    AccessTokenHash: '',
    LastStatusCheckAt: now
  });

  audit_({
    actorUserCode:'PUBLIC',
    actorRole:'Requester',
    eventType:'ACCESS_REQUEST_CREATED',
    entityType:'AccessRequest',
    entityId:requestId,
    organizationCode:organization.OrganizationCode,
    siteCode:site.SiteCode,
    unitCode:unit.UnitCode,
    deviceId:request.deviceId,
    result:'SUCCESS',
    details:'Access request submitted'
  });

  return {ok:true,status:'Pending',requestId:requestId,requestSecret:requestSecret};
}

function requestStatus_(body) {
  const found = verifiedRequest_(body.requestId, body.requestSecret);
  const row = found.object;
  updateObjectAtRow_(SHEETS.ACCESS_REQUESTS, found.rowNumber, {
    LastStatusCheckAt:new Date().toISOString()
  });

  const status = String(row.RequestStatus || 'Pending');
  if (status === 'Approved' && isTrue_(row.IsApproved) && isTrue_(row.IsActive)) {
    return provisionRequest_(
      found.rowNumber,
      Object.assign({}, row, {DeviceID:clean_(body.deviceId,100)||row.DeviceID}),
      'MANUAL_APPROVAL'
    );
  }

  return {
    ok:true,
    status:status,
    active:false,
    rejectionReason:String(row.RejectionReason || '')
  };
}

function activateWithCode_(body) {
  const found = verifiedRequest_(body.requestId, body.requestSecret);
  const request = found.object;
  const normalized = normalizeCode_(body.activationCode);
  if (!normalized) throw new Error('Activation code is empty');

  const codes = objects_(SHEETS.ACTIVATION_CODES);
  let codeRow = null;
  for (let i = 0; i < codes.length; i++) {
    if (String(codes[i].CodeHash || '') === hash_(normalized)) {
      codeRow = {object:codes[i], rowNumber:i + 2};
      break;
    }
  }

  if (!codeRow || !isTrue_(codeRow.object.IsActive)) throw new Error('Activation code is invalid');
  if (codeRow.object.ExpiresAt && new Date(codeRow.object.ExpiresAt) < new Date()) throw new Error('Activation code has expired');

  const unlimited = isTrue_(codeRow.object.UnlimitedUse);
  const maxUses = Number(codeRow.object.MaxUses || 0);
  const useCount = Number(codeRow.object.UseCount || 0);
  if (!unlimited && maxUses > 0 && useCount >= maxUses) throw new Error('Activation code usage limit reached');

  const allowedRoles = ['Reporter','Inspector','Supervisor'];
  const assignedRole = String(codeRow.object.AssignedRole || 'Reporter');
  if (allowedRoles.indexOf(assignedRole) < 0) throw new Error('Activation code cannot assign a management role');

  if (codeRow.object.OrganizationCode && String(codeRow.object.OrganizationCode) !== String(request.OrganizationCode)) throw new Error('Activation code is not valid for this organization');
  if (codeRow.object.SiteCode && String(codeRow.object.SiteCode) !== String(request.SiteCode)) throw new Error('Activation code is not valid for this site');
  if (codeRow.object.UnitCode && String(codeRow.object.UnitCode) !== String(request.UnitCode)) throw new Error('Activation code is not valid for this unit');

  const now = new Date().toISOString();
  updateObjectAtRow_(SHEETS.ACCESS_REQUESTS, found.rowNumber, {
    RequestStatus:'Approved',
    ApprovedRole:assignedRole,
    IsApproved:true,
    IsActive:true,
    ApprovedBy:'ACTIVATION_CODE:' + String(codeRow.object.CodeLabel || ''),
    ApprovedAt:now,
    ActivatedAt:now,
    DeviceID:clean_(body.deviceId,100)||request.DeviceID
  });

  updateObjectAtRow_(SHEETS.ACTIVATION_CODES, codeRow.rowNumber, {
    UseCount:useCount + 1,
    LastUsedBy:request.RequestID,
    LastUsedAt:now
  });

  audit_({
    actorUserCode:'PUBLIC',
    actorRole:'ActivationCode',
    eventType:'ACCOUNT_ACTIVATED_BY_CODE',
    entityType:'AccessRequest',
    entityId:request.RequestID,
    organizationCode:request.OrganizationCode,
    siteCode:request.SiteCode,
    unitCode:request.UnitCode,
    deviceId:body.deviceId,
    result:'SUCCESS',
    details:'Code label: ' + String(codeRow.object.CodeLabel || '')
  });

  return provisionRequest_(
    found.rowNumber,
    objectAtRow_(SHEETS.ACCESS_REQUESTS, found.rowNumber),
    'ACTIVATION_CODE'
  );
}


function activateDedicatedAdmin_(body) {
  const found = verifiedRequest_(body.requestId, body.requestSecret);
  const request = found.object;
  const adminCode = 'USR-ROOT-002';
  const adminRow = findRowNumber_(SHEETS.GLOBAL_ADMINS, 'AdminCode', adminCode);
  if (!adminRow) throw new Error('Dedicated administrator profile is not configured');

  const admin = objectAtRow_(SHEETS.GLOBAL_ADMINS, adminRow);
  const now = new Date();
  if (admin.LockedUntil && new Date(admin.LockedUntil) > now) {
    throw new Error('Dedicated key is temporarily locked. Try again later');
  }

  const submittedName = normalizePersonName_(request.FullName);
  const allowedName = normalizePersonName_(admin.FullName);
  const pin = String(body.dedicatedPin || '').replace(/\D/g,'');
  const deviceId = clean_(body.deviceId, 100);

  if (!/^\d{6}$/.test(pin)) {
    dedicatedAdminFailure_(adminRow, admin, 'INVALID_FORMAT');
    throw new Error('Dedicated key must contain exactly six digits');
  }
  if (submittedName !== allowedName) {
    dedicatedAdminFailure_(adminRow, admin, 'NAME_MISMATCH');
    throw new Error('This dedicated key is not assigned to the submitted identity');
  }
  const expectedHash = String(admin.DedicatedKeyHash || '');
  const actualHash = hash_(String(admin.DedicatedKeySalt || '') + ':' + pin);
  if (!expectedHash || actualHash !== expectedHash) {
    dedicatedAdminFailure_(adminRow, admin, 'INVALID_PIN');
    throw new Error('Dedicated administrator key is invalid');
  }
  if (admin.KeyBoundRequestID && String(admin.KeyBoundRequestID) !== String(request.RequestID)) {
    throw new Error('This key has already been bound to another request');
  }
  if (admin.KeyBoundDeviceID && String(admin.KeyBoundDeviceID) !== String(deviceId)) {
    throw new Error('This key is bound to another device');
  }

  const nowIso = now.toISOString();
  updateObjectAtRow_(SHEETS.GLOBAL_ADMINS, adminRow, {
    AccountBindingStatus:'BOUND_BY_DEDICATED_PIN',
    Active:true,
    KeyBoundRequestID:request.RequestID,
    KeyBoundDeviceID:deviceId,
    FailedAttempts:0,
    LockedUntil:'',
    KeyLastUsedAt:nowIso
  });
  updateObjectAtRow_(SHEETS.ACCESS_REQUESTS, found.rowNumber, {
    RequestStatus:'Approved',
    ApprovedRole:'SystemOwner',
    IsApproved:true,
    IsActive:true,
    ApprovedBy:adminCode,
    ApprovedAt:nowIso,
    ActivatedAt:nowIso,
    DeviceID:deviceId
  });

  const activated = provisionRequest_(
    found.rowNumber,
    Object.assign({}, objectAtRow_(SHEETS.ACCESS_REQUESTS, found.rowNumber), {
      AdminUserCode:adminCode,
      ApprovedRole:'SystemOwner',
      DeviceID:deviceId
    }),
    'DEDICATED_ADMIN_PIN'
  );

  audit_({
    actorUserCode:adminCode,
    actorRole:'SystemOwner',
    eventType:'DEDICATED_ADMIN_ACCOUNT_BOUND',
    entityType:'AccessRequest',
    entityId:request.RequestID,
    organizationCode:request.OrganizationCode,
    siteCode:request.SiteCode,
    unitCode:request.UnitCode,
    deviceId:deviceId,
    result:'SUCCESS',
    details:'Dedicated six-digit administrator key bound to reserved administrator account'
  });
  return activated;
}

function dedicatedAdminFailure_(rowNumber, admin, reason) {
  const attempts = Number(admin.FailedAttempts || 0) + 1;
  const patch = {FailedAttempts:attempts};
  if (attempts >= CONFIG.DEDICATED_ADMIN_MAX_FAILURES) {
    patch.LockedUntil = new Date(Date.now() + CONFIG.DEDICATED_ADMIN_LOCK_MINUTES * 60000).toISOString();
    patch.FailedAttempts = 0;
  }
  updateObjectAtRow_(SHEETS.GLOBAL_ADMINS, rowNumber, patch);
  audit_({
    actorUserCode:'PUBLIC',
    actorRole:'DedicatedAdminAttempt',
    eventType:'DEDICATED_ADMIN_KEY_FAILED',
    entityType:'GlobalAdmin',
    entityId:String(admin.AdminCode || 'USR-ROOT-002'),
    organizationCode:'',
    siteCode:'',
    unitCode:'',
    deviceId:'',
    result:'DENIED',
    details:reason
  });
}

function normalizePersonName_(value) {
  return String(value || '')
    .replace(/[\u200c\u200f\u202a-\u202e]/g,'')
    .replace(/ي/g,'ی')
    .replace(/ك/g,'ک')
    .replace(/\b(دکتر|مهندس|آقای|اقای|خانم)\b/g,'')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9]/g,'')
    .toLowerCase();
}


function sessionProfile_(body) {
  const auth = authorize_(body.accessToken, body.deviceId);
  return {
    ok:true,
    profile:auth.profile,
    units:allowedUnits_(auth.profile),
    organizations:allowedOrganizations_(auth.profile),
    sites:allowedSites_(auth.profile),
    organizationModules:publicOrganizationModules_(),
    brandProfiles:publicBrandProfiles_()
  };
}

function submitRecord_(body) {
  const auth = authorize_(body.accessToken, body.record && body.record.deviceId);
  const r = body.record || {};
  const unit = requireAllowedUnit_(auth.profile, r.unitCode);
  const targetOrganizationCode = String(unit.OrganizationCode || auth.profile.organizationCode);
  const targetOrganization = findObject_(SHEETS.ORGANIZATIONS, 'OrganizationCode', targetOrganizationCode) || {};

  appendOperationalObject_(targetOrganizationCode, SHEETS.RECORDS, {
    RecordID: clean_(r.recordId,100) || id_('REC'),
    SubmittedAtISO: clean_(r.submittedAtISO,80) || new Date().toISOString(),
    SubmittedAtJalali: clean_(r.submittedAtJalali,80),
    UnitCode: unit.UnitCode,
    UnitName: unit.UnitName,
    Site: unit.SiteName || '',
    Shift: clean_(r.shift,40),
    ReporterName: auth.profile.fullName,
    ReporterRole: auth.profile.jobTitle || auth.profile.systemRole,
    RecordType: clean_(r.recordType,100),
    RecordSubtype: clean_(r.recordSubtype,100),
    Title: clean_(r.title,250),
    Description: clean_(r.description,3000),
    Location: clean_(r.location,300),
    RiskLevel: clean_(r.riskLevel,40),
    Severity: clean_(r.severity,40),
    Status: clean_(r.status,60),
    WorkStopped: r.workStopped ? 'بله' : 'خیر',
    ImmediateAction: clean_(r.immediateAction,1500),
    ActionRequired: r.actionRequired ? 'بله' : 'خیر',
    ActionOwner: clean_(r.actionOwner,160),
    DueDate: clean_(r.dueDate,60),
    Latitude: clean_(r.latitude,40),
    Longitude: clean_(r.longitude,40),
    PhotoCount: Number(r.photoCount || 0),
    DeviceID: clean_(r.deviceId,100),
    AppVersion: clean_(r.appVersion,40) || APP_VERSION,
    SyncSource: clean_(r.syncSource,80) || 'Mobile Web',
    LastUpdatedAt: new Date().toISOString(),
    HoldingCode: targetOrganization.HoldingCode || auth.profile.holdingCode,
    OrganizationCode: targetOrganizationCode,
    SiteCode: unit.SiteCode || auth.profile.siteCode,
    UserCode: auth.profile.userCode,
    SystemRole: auth.profile.systemRole
  });

  audit_({
    actorUserCode:auth.profile.userCode,
    actorRole:auth.profile.systemRole,
    eventType:'RECORD_SUBMITTED',
    entityType:'Record',
    entityId:r.recordId,
    organizationCode:targetOrganizationCode,
    siteCode:unit.SiteCode,
    unitCode:unit.UnitCode,
    deviceId:r.deviceId,
    result:'SUCCESS',
    details:clean_(r.title,250)
  });

  return {ok:true,recordId:r.recordId};
}

function submitAction_(body) {
  const auth = authorize_(body.accessToken, body.correctiveAction && body.correctiveAction.deviceId);
  const a = body.correctiveAction || {};
  const unit = requireAllowedUnit_(auth.profile, a.unitCode);
  const targetOrganizationCode = String(unit.OrganizationCode || auth.profile.organizationCode);
  const targetOrganization = findObject_(SHEETS.ORGANIZATIONS, 'OrganizationCode', targetOrganizationCode) || {};

  appendOperationalObject_(targetOrganizationCode, SHEETS.ACTIONS, {
    ActionID: clean_(a.actionId,100) || id_('ACT'),
    SourceRecordID: clean_(a.sourceRecordId,100),
    UnitCode: unit.UnitCode,
    UnitName: unit.UnitName,
    ActionTitle: clean_(a.title,250),
    ActionDescription: clean_(a.description,2000),
    Owner: clean_(a.owner,160),
    DueDate: clean_(a.dueDate,60),
    Priority: clean_(a.priority,40),
    Status: clean_(a.status,60) || 'باز',
    VerificationMethod: clean_(a.verificationMethod,500),
    ClosedAt: clean_(a.closedAt,80),
    VerifiedBy: clean_(a.verifiedBy,160),
    HoldingCode: targetOrganization.HoldingCode || auth.profile.holdingCode,
    OrganizationCode: targetOrganizationCode,
    SiteCode: unit.SiteCode || auth.profile.siteCode,
    UserCode: auth.profile.userCode,
    SystemRole: auth.profile.systemRole
  });

  return {ok:true,actionId:a.actionId};
}

function provisionRequest_(requestRowNumber, request, source) {
  const role = String(request.ApprovedRole || request.RequestedRole || 'Reporter');
  const accessToken = token_('AT');
  const accessHash = hash_(accessToken);
  const now = new Date();
  const nowIso = now.toISOString();
  const userCode = request.AdminUserCode || existingOrNewUserCode_(request);
  const unit = findObject_(SHEETS.UNITS, 'UnitCode', request.UnitCode) || {};
  const organization = findObject_(SHEETS.ORGANIZATIONS, 'OrganizationCode', request.OrganizationCode) || {};
  const site = findObject_(SHEETS.SITES, 'SiteCode', request.SiteCode) || {};

  upsertUser_(userCode, {
    UserCode:userCode,
    FullName:request.FullName,
    Role:request.JobTitle,
    UnitCode:request.UnitCode,
    UnitName:unit.UnitName || '',
    Mobile:request.Mobile,
    Active:true,
    PersonnelNumber:request.PersonnelNumber,
    JobTitle:request.JobTitle,
    OrganizationCode:request.OrganizationCode,
    SiteCode:request.SiteCode,
    SystemRole:role,
    AccountStatus:'Active',
    AccessTokenHash:accessHash,
    DeviceID:request.DeviceID,
    ApprovedBy:request.ApprovedBy || source,
    ApprovedAt:request.ApprovedAt || nowIso,
    LastLoginAt:nowIso
  });

  updateObjectAtRow_(SHEETS.ACCESS_REQUESTS, requestRowNumber, {
    RequestStatus:'Approved',
    ApprovedRole:role,
    IsApproved:true,
    IsActive:true,
    ActivatedAt:request.ActivatedAt || nowIso,
    AccessTokenHash:accessHash,
    LastStatusCheckAt:nowIso
  });

  appendObject_(SHEETS.SESSIONS, {
    SessionID:id_('SES'),
    UserCode:userCode,
    TokenHash:accessHash,
    DeviceID:request.DeviceID,
    CreatedAt:nowIso,
    LastSeenAt:nowIso,
    ExpiresAt:new Date(now.getTime() + CONFIG.SESSION_DAYS*86400000).toISOString(),
    Revoked:false,
    RevokeReason:''
  });

  const profile = {
    userCode:userCode,
    fullName:request.FullName,
    personnelNumber:request.PersonnelNumber,
    mobile:request.Mobile,
    jobTitle:request.JobTitle,
    holdingCode:request.HoldingCode || CONFIG.DEFAULT_HOLDING_CODE,
    organizationCode:request.OrganizationCode,
    organizationName:organization.OrganizationName || request.OrganizationCode,
    legalEntityName:organization.LegalEntityName || '',
    organizationShortName:organization.OrganizationShortName || '',
    operatingModel:organization.OperatingModel || '',
    lifecycleStage:organization.LifecycleStage || '',
    brandProfileCode:organization.BrandProfileCode || '',
    siteCode:request.SiteCode,
    siteName:site.SiteName || request.SiteCode,
    unitCode:request.UnitCode,
    unitName:unit.UnitName || request.UnitCode,
    systemRole:role,
    accountStatus:'Active'
  };

  return {
    ok:true,
    status:'Approved',
    active:true,
    accessToken:accessToken,
    profile:profile,
    units:allowedUnits_(profile)
  };
}

function authorize_(accessToken, deviceId) {
  if (!accessToken) throw new Error('Access token is required');
  const tokenHash = hash_(String(accessToken));
  const sessions = objects_(SHEETS.SESSIONS);
  let session = null;
  let sessionRow = 0;

  for (let i=0;i<sessions.length;i++) {
    if (String(sessions[i].TokenHash || '') === tokenHash) {
      session = sessions[i];
      sessionRow = i+2;
      break;
    }
  }

  if (!session || isTrue_(session.Revoked)) throw new Error('Session is invalid');
  if (session.ExpiresAt && new Date(session.ExpiresAt) < new Date()) throw new Error('Session has expired');
  if (session.DeviceID && deviceId && String(session.DeviceID) !== String(deviceId)) throw new Error('Session belongs to another device');

  const user = findObject_(SHEETS.USERS, 'UserCode', session.UserCode);
  if (!user || !isTrue_(user.Active) || String(user.AccountStatus) !== 'Active') throw new Error('User account is not active');

  updateObjectAtRow_(SHEETS.SESSIONS, sessionRow, {LastSeenAt:new Date().toISOString()});

  const organization = findObject_(SHEETS.ORGANIZATIONS, 'OrganizationCode', user.OrganizationCode) || {};
  const site = findObject_(SHEETS.SITES, 'SiteCode', user.SiteCode) || {};
  const unit = findObject_(SHEETS.UNITS, 'UnitCode', user.UnitCode) || {};

  return {
    user:user,
    profile:{
      userCode:user.UserCode,
      fullName:user.FullName,
      personnelNumber:user.PersonnelNumber,
      mobile:user.Mobile,
      jobTitle:user.JobTitle || user.Role,
      holdingCode:organization.HoldingCode || CONFIG.DEFAULT_HOLDING_CODE,
      organizationCode:user.OrganizationCode,
      organizationName:organization.OrganizationName || user.OrganizationCode,
      legalEntityName:organization.LegalEntityName || '',
      organizationShortName:organization.OrganizationShortName || '',
      operatingModel:organization.OperatingModel || '',
      lifecycleStage:organization.LifecycleStage || '',
      brandProfileCode:organization.BrandProfileCode || '',
      siteCode:user.SiteCode,
      siteName:site.SiteName || user.SiteCode,
      unitCode:user.UnitCode,
      unitName:unit.UnitName || user.UnitName,
      systemRole:user.SystemRole,
      accountStatus:user.AccountStatus
    }
  };
}

function allowedUnits_(profile) {
  const all = activeObjects_(SHEETS.UNITS);
  if (['SystemOwner','SystemAdmin','HoldingHSEManager'].indexOf(String(profile.systemRole)) >= 0) return all;
  if (['MineHSEManager','FactoryHSEManager'].indexOf(String(profile.systemRole)) >= 0) {
    return all.filter(function(u) {
      return String(u.OrganizationCode) === String(profile.organizationCode);
    });
  }
  return all.filter(function(u) {
    return String(u.UnitCode) === String(profile.unitCode);
  });
}

function requireAllowedUnit_(profile, unitCode) {
  const unit = allowedUnits_(profile).find(function(u) {
    return String(u.UnitCode) === String(unitCode);
  });
  if (!unit) throw new Error('User is not authorized for this unit');
  return unit;
}

function verifiedRequest_(requestId, requestSecret) {
  const requests = objects_(SHEETS.ACCESS_REQUESTS);
  for (let i=0;i<requests.length;i++) {
    if (String(requests[i].RequestID) === String(requestId)) {
      if (String(requests[i].RequestSecretHash) !== hash_(String(requestSecret || ''))) {
        throw new Error('Request verification failed');
      }
      return {object:requests[i],rowNumber:i+2};
    }
  }
  throw new Error('Access request not found');
}

function existingOrNewUserCode_(request) {
  const found = objects_(SHEETS.USERS).find(function(u) {
    return String(u.Mobile || '') === String(request.Mobile || '') &&
           String(u.OrganizationCode || '') === String(request.OrganizationCode || '');
  });
  return found ? String(found.UserCode) : id_('USR');
}

function upsertUser_(userCode, object) {
  const users = objects_(SHEETS.USERS);
  for (let i=0;i<users.length;i++) {
    if (String(users[i].UserCode) === String(userCode)) {
      updateObjectAtRow_(SHEETS.USERS, i+2, object);
      return;
    }
  }
  appendObject_(SHEETS.USERS, object);
}

/**
 * Configure one reusable, case-insensitive activation code.
 * rowNumber: target row in ActivationCodes (2..11 reserved)
 */
function setReusableActivationCode(rowNumber, plainCode, label, organizationCode, siteCode, unitCode, assignedRole, isActive) {
  if (rowNumber < 2) throw new Error('rowNumber must be 2 or greater');
  const role = assignedRole || 'Reporter';
  if (['Reporter','Inspector','Supervisor'].indexOf(role) < 0) {
    throw new Error('Reusable code cannot assign management roles');
  }
  if (!normalizeCode_(plainCode)) throw new Error('plainCode is required');

  updateObjectAtRow_(SHEETS.ACTIVATION_CODES, rowNumber, {
    CodeLabel:label || ('CODE-' + rowNumber),
    CodeHash:hash_(normalizeCode_(plainCode)),
    OrganizationCode:organizationCode || '',
    SiteCode:siteCode || '',
    UnitCode:unitCode || '',
    AssignedRole:role,
    UnlimitedUse:true,
    MaxUses:0,
    UseCount:0,
    IsActive:isActive !== false,
    ExpiresAt:'',
    LastUsedBy:'',
    LastUsedAt:'',
    CreatedBy:'USR-ROOT-001',
    Notes:'Reusable, case-insensitive activation code'
  });

  console.log('Activation code configured at row ' + rowNumber);
}

/**
 * Optional helper for the reference user.
 * Manual sheet approval also works.
 */
function approveRequestById(requestId, approvedRole) {
  const requests = objects_(SHEETS.ACCESS_REQUESTS);
  for (let i=0;i<requests.length;i++) {
    if (String(requests[i].RequestID) === String(requestId)) {
      const now = new Date().toISOString();
      updateObjectAtRow_(SHEETS.ACCESS_REQUESTS, i+2, {
        RequestStatus:'Approved',
        ApprovedRole:approvedRole || requests[i].RequestedRole || 'Reporter',
        IsApproved:true,
        IsActive:true,
        ApprovedBy:'USR-ROOT-001',
        ApprovedAt:now,
        ActivatedAt:now
      });
      console.log('Request approved: ' + requestId);
      return;
    }
  }
  throw new Error('Request not found');
}

function audit_(e) {
  appendObject_(SHEETS.AUDIT_LOG, {
    EventID:id_('EVT'),
    EventAt:new Date().toISOString(),
    ActorUserCode:e.actorUserCode || '',
    ActorRole:e.actorRole || '',
    EventType:e.eventType || '',
    EntityType:e.entityType || '',
    EntityID:e.entityId || '',
    OrganizationCode:e.organizationCode || '',
    SiteCode:e.siteCode || '',
    UnitCode:e.unitCode || '',
    DeviceID:e.deviceId || '',
    Result:e.result || '',
    Details:e.details || '',
    AppVersion:APP_VERSION
  });
}


function operationContext_(body) {
  const operation = body.operation || {};
  const auth = authorize_(body.accessToken, operation.deviceId);
  const unit = requireAllowedUnit_(auth.profile, operation.unitCode);
  const organizationCode = String(unit.OrganizationCode || auth.profile.organizationCode);
  const organization = findObject_(SHEETS.ORGANIZATIONS, 'OrganizationCode', organizationCode) || {};
  return {
    operation:operation,
    auth:auth,
    unit:unit,
    organizationCode:organizationCode,
    holdingCode:String(organization.HoldingCode || auth.profile.holdingCode || CONFIG.DEFAULT_HOLDING_CODE),
    now:new Date().toISOString()
  };
}

function submitInspection_(body) {
  const c=operationContext_(body), o=c.operation;
  appendOperationalObject_(c.organizationCode,SHEETS.INSPECTION_RUNS,{
    InspectionID:o.operationId,SubmittedAtISO:o.submittedAtISO,SubmittedAtJalali:o.submittedAtJalali,
    HoldingCode:c.holdingCode,OrganizationCode:c.organizationCode,SiteCode:c.unit.SiteCode,
    UnitCode:c.unit.UnitCode,UserCode:c.auth.profile.userCode,SystemRole:c.auth.profile.systemRole,
    TemplateCode:o.templateCode,InspectionType:o.inspectionType,Location:o.location,Shift:o.shift,
    OverallStatus:o.overallStatus,CompliancePercent:Number(o.compliancePercent||0),CriticalFailures:Number(o.criticalFailures||0),
    NonConformities:Number(o.nonConformities||0),WorkStopped:o.workStopped,Summary:o.summary,
    ActionRequired:o.actionRequired,SyncSource:'Mobile Web',DeviceID:o.deviceId,AppVersion:o.appVersion,LastUpdatedAt:c.now
  });
  (o.responses||[]).forEach(function(r){
    appendOperationalObject_(c.organizationCode,SHEETS.INSPECTION_RESPONSES,{
      ResponseID:r.responseId,InspectionID:o.operationId,ItemCode:r.itemCode,SectionName:r.sectionName,
      ItemText:r.itemText,Response:r.response,IsCritical:r.isCritical,EvidenceRequired:r.evidenceRequired,
      Note:r.note,PhotoCount:Number(r.photoCount||0),RiskLevel:r.riskLevel,ActionRequired:r.actionRequired,
      ActionOwner:r.actionOwner,DueDate:r.dueDate,OrganizationCode:c.organizationCode,
      SiteCode:c.unit.SiteCode,UnitCode:c.unit.UnitCode,UserCode:c.auth.profile.userCode
    });
  });
  if(o.actionRequired)createOperationalAction_(c,o,'پیگیری عدم انطباق بازرسی',o.summary||o.title);
  auditOperational_(c,o,'INSPECTION_SUBMITTED');
  return {ok:true,operationId:o.operationId};
}

function submitRiskAssessment_(body) {
  const c=operationContext_(body),o=c.operation;
  appendOperationalObject_(c.organizationCode,SHEETS.RISK_ASSESSMENTS,{
    RiskAssessmentID:o.operationId,SubmittedAtISO:o.submittedAtISO,HoldingCode:c.holdingCode,
    OrganizationCode:c.organizationCode,SiteCode:c.unit.SiteCode,UnitCode:c.unit.UnitCode,
    UserCode:c.auth.profile.userCode,SystemRole:c.auth.profile.systemRole,Method:o.method,Activity:o.activity,
    Hazard:o.hazard,Consequence:o.consequence,ExposedPersons:o.exposedPersons,ExistingControls:o.existingControls,
    InitialLikelihood:Number(o.initialLikelihood||0),InitialSeverity:Number(o.initialSeverity||0),
    InitialScore:Number(o.initialScore||0),InitialLevel:o.initialLevel,AdditionalControls:o.additionalControls,
    ResidualLikelihood:Number(o.residualLikelihood||0),ResidualSeverity:Number(o.residualSeverity||0),
    ResidualScore:Number(o.residualScore||0),ResidualLevel:o.residualLevel,WorkDecision:o.workDecision,
    ActionOwner:o.actionOwner,DueDate:o.dueDate,Status:o.status||'Submitted',LastUpdatedAt:c.now
  });
  if(o.actionRequired)createOperationalAction_(c,o,'کنترل ریسک: '+o.activity,o.additionalControls);
  auditOperational_(c,o,'RISK_ASSESSMENT_SUBMITTED');
  return {ok:true,operationId:o.operationId};
}

function submitPermit_(body) {
  const c=operationContext_(body),o=c.operation;
  appendOperationalObject_(c.organizationCode,SHEETS.PERMITS,{
    PermitID:o.operationId,SubmittedAtISO:o.submittedAtISO,HoldingCode:c.holdingCode,
    OrganizationCode:c.organizationCode,SiteCode:c.unit.SiteCode,UnitCode:c.unit.UnitCode,
    UserCode:c.auth.profile.userCode,SystemRole:c.auth.profile.systemRole,PermitType:o.permitType,
    JobTitle:o.jobTitle,JobDescription:o.jobDescription,Location:o.location,Requester:o.requester,
    ResponsibleSupervisor:o.responsibleSupervisor,StartAt:o.startAt,EndAt:o.endAt,Hazards:o.hazards,
    Controls:o.controls,IsolationRequired:o.isolationRequired,LOTOConfirmed:o.lotoConfirmed,
    GasTestRequired:o.gasTestRequired,GasTestResult:o.gasTestResult,PPE:o.ppe,
    EmergencyControls:o.emergencyControls,AuthorizationStatus:o.authorizationStatus||'Requested',
    IssuedBy:'',ClosedBy:'',ClosedAt:'',DeviceID:o.deviceId,LastUpdatedAt:c.now
  });
  auditOperational_(c,o,'PERMIT_REQUESTED');
  return {ok:true,operationId:o.operationId};
}

function submitIncident_(body) {
  const c=operationContext_(body),o=c.operation;
  appendOperationalObject_(c.organizationCode,SHEETS.INCIDENTS,{
    IncidentID:o.operationId,SubmittedAtISO:o.submittedAtISO,HoldingCode:c.holdingCode,
    OrganizationCode:c.organizationCode,SiteCode:c.unit.SiteCode,UnitCode:c.unit.UnitCode,
    UserCode:c.auth.profile.userCode,SystemRole:c.auth.profile.systemRole,EventType:o.eventType,
    EventDateTime:o.eventDateTime,Location:o.location,Description:o.description,ActualSeverity:o.actualSeverity,
    PotentialSeverity:o.potentialSeverity,InjuryOccurred:o.injuryOccurred,InjuredPerson:o.injuredPerson,
    LostTime:o.lostTime,AssetDamage:o.assetDamage,EnvironmentalImpact:o.environmentalImpact,
    ImmediateActions:o.immediateActions,AreaSecured:o.areaSecured,NotificationStatus:o.notificationStatus,
    DirectCause:o.directCause,RootCause:o.rootCause,InvestigationStatus:o.investigationStatus,
    ActionRequired:o.actionRequired,ReportedBy:o.reportedBy,DeviceID:o.deviceId,AppVersion:o.appVersion,LastUpdatedAt:c.now
  });
  if(o.actionRequired)createOperationalAction_(c,o,'پیگیری '+o.eventType,o.immediateActions||o.description);
  auditOperational_(c,o,'INCIDENT_SUBMITTED');
  return {ok:true,operationId:o.operationId};
}

function submitDailyReport_(body) {
  const c=operationContext_(body),o=c.operation;
  appendOperationalObject_(c.organizationCode,SHEETS.DAILY_REPORTS,{
    DailyReportID:o.operationId,ReportDate:o.reportDate,SubmittedAtISO:o.submittedAtISO,
    HoldingCode:c.holdingCode,OrganizationCode:c.organizationCode,
    SiteCode:c.unit.SiteCode,UnitCode:c.unit.UnitCode,UserCode:c.auth.profile.userCode,
    SystemRole:c.auth.profile.systemRole,Shift:o.shift,Headcount:Number(o.headcount||0),
    WorkHours:Number(o.workHours||0),InspectionsCount:Number(o.inspectionsCount||0),
    UnsafeConditionsCount:Number(o.unsafeConditionsCount||0),ToolboxCount:Number(o.toolboxCount||0),
    PermitsActive:Number(o.permitsActive||0),IncidentsCount:Number(o.incidentsCount||0),
    NearMissCount:Number(o.nearMissCount||0),OpenActions:Number(o.openActions||0),
    CriticalRisks:Number(o.criticalRisks||0),EquipmentDefects:Number(o.equipmentDefects||0),
    EnvironmentalEvents:Number(o.environmentalEvents||0),TrainingHours:Number(o.trainingHours||0),
    KeyActivities:o.keyActivities,KeyFindings:o.keyFindings,HSESummary:o.hseSummary,
    SupervisorName:o.supervisorName,LastUpdatedAt:c.now
  });
  auditOperational_(c,o,'DAILY_REPORT_SUBMITTED');
  return {ok:true,operationId:o.operationId};
}

function createOperationalAction_(c,o,title,description) {
  appendOperationalObject_(c.organizationCode,SHEETS.ACTIONS,{
    ActionID:id_('ACT'),SourceRecordID:o.operationId,UnitCode:c.unit.UnitCode,UnitName:c.unit.UnitName,
    ActionTitle:title,ActionDescription:description||'',Owner:o.actionOwner||'',
    DueDate:o.dueDate||'',Priority:o.riskLevel||o.residualLevel||o.potentialSeverity||'بالا',
    Status:'باز',VerificationMethod:'بازدید و ثبت شواهد',ClosedAt:'',VerifiedBy:'',
    HoldingCode:c.holdingCode,OrganizationCode:c.organizationCode,
    SiteCode:c.unit.SiteCode,UserCode:c.auth.profile.userCode,SystemRole:c.auth.profile.systemRole
  });
}

function auditOperational_(c,o,eventType) {
  audit_({
    actorUserCode:c.auth.profile.userCode,actorRole:c.auth.profile.systemRole,eventType:eventType,
    entityType:o.module,entityId:o.operationId,organizationCode:c.organizationCode,
    siteCode:c.unit.SiteCode,unitCode:c.unit.UnitCode,deviceId:o.deviceId,result:'SUCCESS',
    details:o.title||''
  });
}


function publicOrganizations_() {
  return activeObjects_(SHEETS.ORGANIZATIONS)
    .filter(function(o) { return String(o.OrganizationType) !== 'PARENT_COMPANY'; })
    .map(function(o) {
      return {
        HoldingCode:String(o.HoldingCode||''),
        HoldingName:String(o.HoldingName||''),
        LegalEntityCode:String(o.LegalEntityCode||''),
        LegalEntityName:String(o.LegalEntityName||''),
        OrganizationCode:String(o.OrganizationCode||''),
        OrganizationName:String(o.OrganizationName||''),
        OrganizationShortName:String(o.OrganizationShortName||''),
        OrganizationType:String(o.OrganizationType||''),
        OperatingModel:String(o.OperatingModel||''),
        Commodity:String(o.Commodity||''),
        LifecycleStage:String(o.LifecycleStage||''),
        ParentOrganizationCode:String(o.ParentOrganizationCode||''),
        Province:String(o.Province||''),
        City:String(o.City||''),
        BrandProfileCode:String(o.BrandProfileCode||''),
        Active:o.Active,
        DisplayOrder:Number(o.DisplayOrder||0),
        Notes:String(o.Notes||''),
        SourceURL:String(o.SourceURL||''),
        NeedsReview:o.NeedsReview,
        HoldingBrandProfileCode:String(o.HoldingBrandProfileCode||''),
        OperatingBrandProfileCode:String(o.OperatingBrandProfileCode||o.BrandProfileCode||''),
        BrandLockPolicy:String(o.BrandLockPolicy||'')
      };
    })
    .sort(function(a,b){return a.DisplayOrder-b.DisplayOrder;});
}

function publicSites_() {
  return activeObjects_(SHEETS.SITES).map(function(s) {
    return {
      SiteCode:String(s.SiteCode||''),
      SiteName:String(s.SiteName||''),
      OrganizationCode:String(s.OrganizationCode||''),
      SiteType:String(s.SiteType||''),
      LifecycleStage:String(s.LifecycleStage||''),
      Province:String(s.Province||''),
      City:String(s.City||''),
      Active:s.Active,
      DisplayOrder:Number(s.DisplayOrder||0),
      Notes:String(s.Notes||'')
    };
  });
}

function publicUnits_() {
  return activeObjects_(SHEETS.UNITS).map(function(u) {
    return {
      UnitCode:String(u.UnitCode||''),
      UnitName:String(u.UnitName||''),
      SiteName:String(u.SiteName||''),
      Active:u.Active,
      OrganizationCode:String(u.OrganizationCode||''),
      SiteCode:String(u.SiteCode||''),
      UnitType:String(u.UnitType||''),
      ProfileCode:String(u.ProfileCode||''),
      ModuleScope:String(u.ModuleScope||'')
    };
  });
}

function publicBrandProfiles_() {
  return activeObjects_(SHEETS.BRAND_PROFILES).map(function(b) {
    return {
      ProfileCode:String(b.ProfileCode||''),
      DisplayName:String(b.DisplayName||''),
      LegalName:String(b.LegalName||''),
      ShortName:String(b.ShortName||''),
      WebsiteURL:String(b.WebsiteURL||''),
      LogoURL:String(b.LogoURL||''),
      HeroImageURL:String(b.HeroImageURL||''),
      PrimaryColor:String(b.PrimaryColor||''),
      AccentColor:String(b.AccentColor||''),
      TextColor:String(b.TextColor||''),
      UseOfficialBrand:b.UseOfficialBrand,
      Active:b.Active,
      BrandLevel:String(b.BrandLevel||''),
      ParentProfileCode:String(b.ParentProfileCode||''),
      BrandLocked:b.BrandLocked
    };
  });
}

function publicOrganizationModules_() {
  return objects_(SHEETS.ORGANIZATION_MODULES)
    .filter(function(m){return isTrue_(m.Enabled);})
    .map(function(m){
      return {
        OrganizationCode:String(m.OrganizationCode||''),
        SiteCode:String(m.SiteCode||''),
        ModuleCode:String(m.ModuleCode||''),
        ModuleNameFA:String(m.ModuleNameFA||''),
        Enabled:m.Enabled,
        Priority:Number(m.Priority||99),
        TemplateSet:String(m.TemplateSet||''),
        ScopeType:String(m.ScopeType||''),
        Notes:String(m.Notes||'')
      };
    });
}

function sanitizeChecklistTemplate_(t) {
  return {
    TemplateCode:String(t.TemplateCode||''),
    TemplateName:String(t.TemplateName||''),
    ScopeType:String(t.ScopeType||''),
    OrganizationType:String(t.OrganizationType||''),
    ActivityType:String(t.ActivityType||''),
    Version:String(t.Version||''),
    IsActive:t.IsActive,
    RequiredPhotoOnNC:t.RequiredPhotoOnNC,
    CriticalFailStopsWork:t.CriticalFailStopsWork,
    Notes:String(t.Notes||'')
  };
}

function sanitizeChecklistItem_(i) {
  return {
    ItemCode:String(i.ItemCode||''),
    TemplateCode:String(i.TemplateCode||''),
    DisplayOrder:Number(i.DisplayOrder||0),
    SectionName:String(i.SectionName||''),
    ItemText:String(i.ItemText||''),
    ResponseType:String(i.ResponseType||''),
    IsCritical:i.IsCritical,
    RequireEvidenceOnNo:i.RequireEvidenceOnNo,
    DefaultRiskLevel:String(i.DefaultRiskLevel||''),
    ReferenceCode:String(i.ReferenceCode||''),
    IsActive:i.IsActive
  };
}

function allowedOrganizations_(profile) {
  const all = publicOrganizations_();
  if (isElevatedServerRole_(profile.systemRole)) return all;
  return all.filter(function(o){return String(o.OrganizationCode)===String(profile.organizationCode);});
}

function allowedSites_(profile) {
  const all = publicSites_();
  if (isElevatedServerRole_(profile.systemRole)) return all;
  return all.filter(function(s){return String(s.OrganizationCode)===String(profile.organizationCode);});
}

function isElevatedServerRole_(role) {
  return ['SystemOwner','SystemAdmin','HoldingHSEManager'].indexOf(String(role)) >= 0;
}

function partitionForOrganization_(organizationCode) {
  const partition = activeObjects_(SHEETS.DATA_PARTITIONS).find(function(p) {
    return String(p.OrganizationCode) === String(organizationCode);
  });
  if (!partition || !partition.SpreadsheetId) {
    throw new Error('Operational data partition is not configured for organization: ' + organizationCode);
  }
  return partition;
}

function operationalSpreadsheet_(organizationCode) {
  return SpreadsheetApp.openById(String(partitionForOrganization_(organizationCode).SpreadsheetId));
}

function appendOperationalObject_(organizationCode, sheetName, obj) {
  const child = operationalSpreadsheet_(organizationCode);
  const sheet = getOrCreateSheet_(child, sheetName);
  const headers = HEADERS[sheetName];
  ensureHeaders_(sheet, headers);
  sheet.appendRow(headers.map(function(h) {
    return obj[h] === undefined ? '' : obj[h];
  }));
}

function ensureChildWorkbook_(child, partition) {
  let readme = child.getSheetByName('README');
  if (!readme) {
    const first = child.getSheets()[0];
    if (first && first.getName() === 'Sheet1') {
      first.setName('README');
      readme = first;
    } else {
      readme = child.insertSheet('README', 0);
    }
  }

  const operationalNames = [
    'Records','Actions','ChecklistTemplates','ChecklistItems','GlobalAdmins','InspectionRuns',
    'InspectionResponses','RiskAssessments','Permits','Incidents','DailyReports'
  ];
  operationalNames.forEach(function(name) {
    ensureHeaders_(getOrCreateSheet_(child, name), HEADERS[name]);
    styleHeader_(child.getSheetByName(name), HEADERS[name].length);
  });

  const dashboard = getOrCreateSheet_(child, 'Dashboard');
  dashboard.getRange('A1:H1').merge();
  dashboard.getRange('A1').setValue('SafetyManage Operational Dashboard — ' + String(partition.OrganizationCode));
  dashboard.getRange('A1:H1').setBackground('#0B1220').setFontColor('#FFFFFF').setFontWeight('bold').setHorizontalAlignment('center');
  dashboard.getRange('A2:B8').setValues([
    ['شاخص','مقدار'],
    ['Records','=MAX(0,COUNTA(Records!A:A)-1)'],
    ['Inspections','=MAX(0,COUNTA(InspectionRuns!A:A)-1)'],
    ['Risk Assessments','=MAX(0,COUNTA(RiskAssessments!A:A)-1)'],
    ['Permits','=MAX(0,COUNTA(Permits!A:A)-1)'],
    ['Incidents','=MAX(0,COUNTA(Incidents!A:A)-1)'],
    ['Open Actions','=COUNTIF(Actions!J:J,"<>بسته")-1']
  ]);
  styleHeader_(dashboard, 2, 2);

  readme.getRange('A1:B8').setValues([
    ['SafetyManage Data Partition v4.1', String(partition.OrganizationCode)],
    ['PartitionCode',String(partition.PartitionCode)],
    ['OrganizationCode',String(partition.OrganizationCode)],
    ['RoutingMode',String(partition.RoutingMode)],
    ['IndependentLegalEntity',String(partition.IsIndependentLegalEntity)],
    ['Privacy','Private Google Sheet — API access only'],
    ['InitializedAt',new Date().toISOString()],
    ['GatewayVersion',APP_VERSION]
  ]);
  readme.getRange('A1:B1').setBackground('#0B1220').setFontColor('#FFFFFF').setFontWeight('bold');
  readme.autoResizeColumns(1,2);

  copyMasterReferenceData_(child);
}

function copyMasterReferenceData_(child) {
  const templates = objects_(SHEETS.CHECKLIST_TEMPLATES);
  const items = objects_(SHEETS.CHECKLIST_ITEMS);
  replaceSheetObjects_(child, SHEETS.CHECKLIST_TEMPLATES, templates);
  replaceSheetObjects_(child, SHEETS.CHECKLIST_ITEMS, items);
}

function replaceSheetObjects_(spreadsheet, sheetName, rows) {
  const sheet = getOrCreateSheet_(spreadsheet, sheetName);
  const headers = HEADERS[sheetName];
  sheet.clearContents();
  sheet.getRange(1,1,1,headers.length).setValues([headers]);
  if (rows.length) {
    sheet.getRange(2,1,rows.length,headers.length).setValues(rows.map(function(obj){
      return headers.map(function(h){return obj[h]===undefined?'':obj[h];});
    }));
  }
  styleHeader_(sheet, headers.length);
}

function styleHeader_(sheet, columnCount, rowNumber) {
  if (!sheet) return;
  const row = rowNumber || 1;
  sheet.setFrozenRows(row);
  sheet.getRange(row,1,1,columnCount)
    .setBackground('#0B1220')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setWrap(true);
}

function findRowNumber_(sheetName, key, value) {
  const rows = objects_(sheetName);
  for (let i=0;i<rows.length;i++) {
    if (String(rows[i][key])===String(value)) return i+2;
  }
  return 0;
}

function sheetDataCount_(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  return sheet ? Math.max(0, sheet.getLastRow()-1) : 0;
}

function openActionCount_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(SHEETS.ACTIONS);
  if (!sheet || sheet.getLastRow()<2) return 0;
  const values = sheet.getRange(2,10,sheet.getLastRow()-1,1).getValues();
  return values.filter(function(r){return String(r[0]||'')!=='بسته';}).length;
}

function portfolioSummary_(body) {
  const auth = authorize_(body.accessToken, body.deviceId);
  if (!isElevatedServerRole_(auth.profile.systemRole)) throw new Error('Portfolio access is not permitted');

  const organizations = publicOrganizations_();
  const sites = publicSites_();
  const summaries = organizations.map(function(org) {
    let inspections=0,incidents=0,openActions=0,riskAssessments=0,permits=0,dailyReports=0;
    try {
      const child = operationalSpreadsheet_(org.OrganizationCode);
      inspections=sheetDataCount_(child,SHEETS.INSPECTION_RUNS);
      incidents=sheetDataCount_(child,SHEETS.INCIDENTS);
      openActions=openActionCount_(child);
      riskAssessments=sheetDataCount_(child,SHEETS.RISK_ASSESSMENTS);
      permits=sheetDataCount_(child,SHEETS.PERMITS);
      dailyReports=sheetDataCount_(child,SHEETS.DAILY_REPORTS);
    } catch (_) {}
    const orgSites=sites.filter(function(s){return s.OrganizationCode===org.OrganizationCode;});
    return {
      organizationCode:org.OrganizationCode,
      organizationName:org.OrganizationName,
      operatingModel:org.OperatingModel,
      lifecycleStage:org.LifecycleStage,
      defaultSiteCode:orgSites.length?orgSites[0].SiteCode:'',
      siteCount:orgSites.length,
      inspections:inspections,
      incidents:incidents,
      openActions:openActions,
      riskAssessments:riskAssessments,
      permits:permits,
      dailyReports:dailyReports
    };
  });

  return {ok:true,organizations:summaries};
}

function seedPortfolioTemplateCatalog_() {
  const existing = objects_(SHEETS.CHECKLIST_TEMPLATES).map(function(x){return String(x.TemplateCode);});
  const templates = [
    ['MINE-HAUL-ROAD','جاده معدنی و ترافیک','MINING'],
    ['MINE-BERM','برم و لبه‌های خطرناک','MINING'],
    ['MINE-PIT-BENCH','پیت، بنچ و دیواره','MINING'],
    ['MINE-BLASTING','حفاری و آتشباری','MINING'],
    ['MINE-DUMP','دامپ و محل تخلیه','MINING'],
    ['EQUIPMENT-PRESHIFT','بازرسی پیش از شیفت ماشین‌آلات','BOTH'],
    ['FACTORY-LOTO','قفل و برچسب‌گذاری انرژی','FACTORY'],
    ['FACTORY-CRUSHER-CONVEYOR','سنگ‌شکن و نوار نقاله','FACTORY'],
    ['FACTORY-ROTATING','ماشین‌آلات دوار','FACTORY'],
    ['FACTORY-ELECTRICAL','ایمنی برق و ابزار دقیق','FACTORY'],
    ['FACTORY-CHEMICAL','مواد شیمیایی و SDS','FACTORY'],
    ['FACTORY-EMERGENCY','آمادگی و تجهیزات اضطراری','FACTORY'],
    ['EXPLORATION-CORE-DRILLING','حفاری مغزه‌گیری','EXPLORATION'],
    ['EXPLORATION-FIELD','عملیات صحرایی و نمونه‌برداری','EXPLORATION'],
    ['EXPLORATION-CAMP','کمپ و اسکان','EXPLORATION'],
    ['EXPLORATION-VEHICLE','خودرو و تردد صحرایی','EXPLORATION']
  ];
  templates.forEach(function(t){
    if (existing.indexOf(t[0])<0) {
      appendObject_(SHEETS.CHECKLIST_TEMPLATES,{
        TemplateCode:t[0],TemplateName:t[1],ScopeType:'Specialized',OrganizationType:t[2],
        ActivityType:t[0],Version:'1.0',IsActive:true,RequiredPhotoOnNC:true,
        CriticalFailStopsWork:true,CreatedBy:'USR-ROOT-001',UpdatedAt:new Date().toISOString(),
        Notes:'Portfolio v4 specialized template; item library is also available in the mobile client.'
      });
    }
  });
}

function seedOperationalCore_() {
  if (objects_(SHEETS.CHECKLIST_TEMPLATES).length === 0) {
    [
      {TemplateCode:'MINE-DAILY-001',TemplateName:'بازرسی روزانه معدن روباز',ScopeType:'Operational',OrganizationType:'MINING',ActivityType:'Daily Area Inspection',Version:'1.0',IsActive:true,RequiredPhotoOnNC:true,CriticalFailStopsWork:true,CreatedBy:'USR-ROOT-001',UpdatedAt:new Date().toISOString(),Notes:'پیت، جاده، برم و دامپ'},
      {TemplateCode:'FACTORY-DAILY-001',TemplateName:'بازرسی روزانه کارخانه',ScopeType:'Operational',OrganizationType:'FACTORY',ActivityType:'Daily Factory Inspection',Version:'1.0',IsActive:true,RequiredPhotoOnNC:true,CriticalFailStopsWork:true,CreatedBy:'USR-ROOT-001',UpdatedAt:new Date().toISOString(),Notes:'خط تولید و ماشین‌آلات'},
      {TemplateCode:'EQUIPMENT-PRESHIFT-001',TemplateName:'بازرسی پیش از شیفت ماشین‌آلات',ScopeType:'Equipment',OrganizationType:'BOTH',ActivityType:'Pre-shift Equipment Check',Version:'1.0',IsActive:true,RequiredPhotoOnNC:true,CriticalFailStopsWork:true,CreatedBy:'USR-ROOT-001',UpdatedAt:new Date().toISOString(),Notes:'معدن و کارخانه'}
    ].forEach(function(x){appendObject_(SHEETS.CHECKLIST_TEMPLATES,x);});
  }

  if (objects_(SHEETS.CHECKLIST_ITEMS).length === 0) {
    const data = [
      ['M01','MINE-DAILY-001',1,'جاده و ترافیک','عرض، شیب، دید و سطح جاده برای تردد ایمن مناسب است',false],
      ['M02','MINE-DAILY-001',2,'جاده و ترافیک','برم یا خاکریز ایمنی در لبه‌های خطرناک پیوسته و کافی است',true],
      ['M03','MINE-DAILY-001',3,'پیت و دامپ','پایداری بنچ و دیواره علائم ناپایداری آشکار ندارد',true],
      ['M04','MINE-DAILY-001',4,'پیت و دامپ','محل تخلیه و عقب‌روی دامپ دارای کنترل لبه است',true],
      ['M05','MINE-DAILY-001',5,'عملیات','محدوده حفاری یا آتشباری ایمن‌سازی شده است',true],
      ['M06','MINE-DAILY-001',6,'عمومی','گردوغبار، روشنایی و دید کنترل شده است',false],
      ['F01','FACTORY-DAILY-001',1,'ماشین‌آلات','حفاظ قسمت‌های متحرک و نقاط گیرکردن کامل است',true],
      ['F02','FACTORY-DAILY-001',2,'ماشین‌آلات','توقف اضطراری در دسترس و سالم است',true],
      ['F03','FACTORY-DAILY-001',3,'انرژی','روش LOTO برای تعمیرات رعایت شده است',true],
      ['F04','FACTORY-DAILY-001',4,'اضطراری','تجهیزات اطفا در محل و آماده است',true],
      ['F05','FACTORY-DAILY-001',5,'محیط','مسیرهای خروج و تردد باز هستند',false],
      ['F06','FACTORY-DAILY-001',6,'خانه‌داری','ضایعات و نشت‌ها کنترل شده‌اند',false],
      ['E01','EQUIPMENT-PRESHIFT-001',1,'ترمز و فرمان','ترمز سرویس، پارک و فرمان عملکرد مناسب دارند',true],
      ['E02','EQUIPMENT-PRESHIFT-001',2,'چرخ و لاستیک','لاستیک، چرخ و اتصالات فاقد نقص بحرانی هستند',true],
      ['E03','EQUIPMENT-PRESHIFT-001',3,'هشدار','چراغ، بوق و آژیر دنده عقب سالم است',true],
      ['E04','EQUIPMENT-PRESHIFT-001',4,'حفاظت راننده','کمربند و کابین سالم است',true],
      ['E05','EQUIPMENT-PRESHIFT-001',5,'نشتی','نشتی سوخت، روغن یا هیدرولیک وجود ندارد',true],
      ['E06','EQUIPMENT-PRESHIFT-001',6,'اطفا','کپسول یا سیستم اطفا آماده است',true]
    ];
    data.forEach(function(x){
      appendObject_(SHEETS.CHECKLIST_ITEMS,{
        ItemCode:x[0],TemplateCode:x[1],DisplayOrder:x[2],SectionName:x[3],ItemText:x[4],
        ResponseType:'YES_NO_NA',IsCritical:x[5],RequireEvidenceOnNo:true,
        ApplicableToMining:x[1].indexOf('FACTORY')<0,ApplicableToFactory:x[1].indexOf('MINE')<0,
        DefaultRiskLevel:x[5]?'بالا':'متوسط',ReferenceCode:'',IsActive:true,
        UpdatedAt:new Date().toISOString(),Notes:''
      });
    });
  }
}

function initializeOperationalCore() {
  initializePortfolioArchitecture();
}

function initializeCorporateAccessV41() {
  initializePortfolioArchitecture();
}

function ss_() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function ensureHeaders_(sheet, headers) {
  const current = sheet.getRange(1,1,1,headers.length).getValues()[0];
  if (headers.some(function(h,i) { return String(current[i] || '') !== String(h); })) {
    sheet.getRange(1,1,1,headers.length).setValues([headers]);
  }
  sheet.setFrozenRows(1);
}

function objects_(sheetName) {
  const sheet = ss_().getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);

  return values.slice(1)
    .filter(function(row) { return row.some(function(v) { return v !== ''; }); })
    .map(function(row) {
      const obj = {};
      headers.forEach(function(h,i) { obj[h] = row[i]; });
      return obj;
    });
}

function activeObjects_(sheetName) {
  return objects_(sheetName).filter(function(o) {
    return !Object.prototype.hasOwnProperty.call(o,'Active') || isTrue_(o.Active);
  });
}

function findObject_(sheetName, key, value) {
  return objects_(sheetName).find(function(o) {
    return String(o[key]) === String(value);
  }) || null;
}

function objectAtRow_(sheetName, rowNumber) {
  const sheet = ss_().getSheetByName(sheetName);
  const headers = HEADERS[sheetName];
  const row = sheet.getRange(rowNumber,1,1,headers.length).getValues()[0];
  const obj = {};
  headers.forEach(function(h,i) { obj[h] = row[i]; });
  return obj;
}

function appendObject_(sheetName, obj) {
  const sheet = getOrCreateSheet_(ss_(), sheetName);
  const headers = HEADERS[sheetName];
  ensureHeaders_(sheet, headers);
  sheet.appendRow(headers.map(function(h) {
    return obj[h] === undefined ? '' : obj[h];
  }));
}

function updateObjectAtRow_(sheetName, rowNumber, patch) {
  const sheet = ss_().getSheetByName(sheetName);
  const headers = HEADERS[sheetName];
  const row = sheet.getRange(rowNumber,1,1,headers.length).getValues()[0];
  headers.forEach(function(h,i) {
    if (Object.prototype.hasOwnProperty.call(patch,h)) row[i] = patch[h];
  });
  sheet.getRange(rowNumber,1,1,headers.length).setValues([row]);
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error('Empty request body');
  try {
    return JSON.parse(e.postData.contents);
  } catch (_) {
    throw new Error('Invalid JSON body');
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean_(value, max) {
  return String(value === undefined || value === null ? '' : value)
    .trim()
    .slice(0, max || 500);
}

function isTrue_(v) {
  return v === true ||
    String(v).trim().toUpperCase() === 'TRUE' ||
    String(v).trim() === '1';
}

function normalizeCode_(v) {
  return String(v || '').trim().toUpperCase();
}

function hash_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value || ''),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(b) {
    const x = (b + 256) % 256;
    return ('0' + x.toString(16)).slice(-2);
  }).join('');
}

function token_(prefix) {
  return prefix + '-' +
    Utilities.getUuid().replace(/-/g,'') + '-' +
    Math.floor(Math.random()*1e9).toString(36).toUpperCase();
}

function id_(prefix) {
  return prefix + '-' +
    Date.now().toString(36).toUpperCase() + '-' +
    Math.random().toString(36).slice(2,8).toUpperCase();
}
