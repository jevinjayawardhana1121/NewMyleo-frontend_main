// Mock data fallback with complete Leo Multiple District 306 Reporting Hierarchy & Data Isolation

export const MOCK_PROJECTS = [
  // District 306 A1 - Region 1 - Club 1: Colombo Millennium
  {
    id: 101,
    name: 'Sight First Mega Eye Screening Camp',
    category: 'Health & Wellness',
    status: 3, // Approved by District President
    approved_by_rc: true,
    forwarded_to_md: true,
    club_id: '1',
    club_name: 'Colombo Millennium',
    clubName: 'Colombo Millennium',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 A1',
    district_name: 'District 306 A1',
    date: '2026-10-15',
    venue: 'Community Center, Colombo 07',
    description: 'Conducted comprehensive vision screenings, distributed 250 prescription eyeglasses, and referred 14 cataract patients for surgery.',
    objectives: 'Screen 500 individuals, provide free optical correction.',
    beneficiaries: 520,
    volunteerHours: 72,
    contestMetrics: 'Ranked Outstanding District Health Project',
    is_phase_project: true,
    parent_project_name: 'Community Wellness Initiative 2026',
    phase_name: 'Phase 2: Optical Care',
    chairpersons: [{ id: 1, fName: 'Jevin', lName: 'Jayawardhana', mylci: '4892011' }],
    committee: [{ id: 2, fName: 'Devin', lName: 'Perera', mylci: '4892012' }],
    incomes: [
      { desc: 'Lions Club Sponsorship', amount: '120000' },
      { desc: 'Club Service Fund', amount: '45000' }
    ],
    expenses: [
      { desc: 'Eyeglasses & Lenses', amount: '95000' },
      { desc: 'Optometrist Professional Fees', amount: '40000' },
      { desc: 'Refreshments & Logistics', amount: '25000' }
    ],
    images: [],
    album_url: 'https://photos.app.goo.gl/sightfirst2026',
    publicityLink: 'https://facebook.com/leomd306/posts/sightfirst2026',
  },
  {
    id: 102,
    name: 'Green Horizon: Coastal Reforestation',
    category: 'Environment & Climate',
    status: 3, // Approved by District President
    approved_by_rc: true,
    forwarded_to_md: true,
    club_id: '1',
    club_name: 'Colombo Millennium',
    clubName: 'Colombo Millennium',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 A1',
    district_name: 'District 306 A1',
    date: '2026-09-22',
    venue: 'Kalutara Coastal Reserve',
    description: 'Planted 1,000 mangrove saplings along the coastal belt to prevent tidal erosion and promote marine biodiversity.',
    objectives: 'Restore 2 hectares of mangrove reserve.',
    beneficiaries: 1200,
    volunteerHours: 96,
    contestMetrics: 'MD 306 Eco Stewardship Award Nominee',
    is_phase_project: false,
    chairpersons: [{ id: 1, fName: 'Jevin', lName: 'Jayawardhana', mylci: '4892011' }],
    committee: [],
    incomes: [{ desc: 'Environmental Grant', amount: '80000' }],
    expenses: [{ desc: 'Saplings & Soil Enrichment', amount: '65000' }, { desc: 'Transport', amount: '15000' }],
    images: [],
    album_url: 'https://drive.google.com/drive/folders/greenhorizon',
    publicityLink: 'https://facebook.com/leomd306/posts/greenhorizon'
  },
  {
    id: 103,
    name: 'Future Leaders Youth Workshop',
    category: 'Youth Empowerment',
    status: 2, // Pending Review (Region Chairperson or District President)
    approved_by_rc: false,
    forwarded_to_md: false,
    club_id: '1',
    club_name: 'Colombo Millennium',
    clubName: 'Colombo Millennium',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 A1',
    district_name: 'District 306 A1',
    date: '2026-11-04',
    venue: 'Royal College Sports Complex',
    description: 'Soft skills, public speaking, and project management training program conducted for 80 high school prefects.',
    objectives: 'Equip youth with communication and collaborative teamwork abilities.',
    beneficiaries: 80,
    volunteerHours: 32,
    contestMetrics: '',
    is_phase_project: true,
    parent_project_name: 'Youth Leadership Series',
    phase_name: 'Phase 1: Foundations of Leadership',
    chairpersons: [{ id: 3, fName: 'Kavindi', lName: 'Silva', mylci: '4892015' }],
    committee: [],
    incomes: [{ desc: 'Participant Registration', amount: '40000' }],
    expenses: [{ desc: 'Hall Rental & AV', amount: '25000' }, { desc: 'Workbooks & Badges', amount: '12000' }],
    images: [],
    publicityLink: ''
  },

  // District 306 A1 - Region 1 - Club 2: Nawala Metro
  {
    id: 104,
    name: 'Care For Stray Paws: Animal Welfare Drive',
    category: 'Environment & Climate',
    status: 2, // Pending Review
    approved_by_rc: false,
    forwarded_to_md: false,
    club_id: '2',
    club_name: 'Nawala Metro',
    clubName: 'Nawala Metro',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 A1',
    district_name: 'District 306 A1',
    date: '2026-10-28',
    venue: 'Nawala Wetland Park',
    description: 'Vaccinated and treated 150 community stray animals with free anti-rabies inoculations and dietary supplements.',
    objectives: 'Promote humane animal welfare and eradication of rabies.',
    beneficiaries: 150,
    volunteerHours: 40,
    is_phase_project: false,
    chairpersons: [{ id: 10, fName: 'Sanuka', lName: 'Perera', mylci: '4892050' }],
    committee: [],
    incomes: [{ desc: 'Donations', amount: '60000' }],
    expenses: [{ desc: 'Veterinary Supplies', amount: '55000' }],
    images: [],
    publicityLink: 'https://facebook.com/nawalametro/posts/straypaws'
  },

  // District 306 A1 - Region 2 - Club 3: Negombo Orient
  {
    id: 105,
    name: 'Lagoon Fisher Community Relief Drive',
    category: 'Hunger Relief',
    status: 3, // Approved
    approved_by_rc: true,
    forwarded_to_md: true,
    club_id: '3',
    club_name: 'Negombo Orient',
    clubName: 'Negombo Orient',
    region_id: '2', // Region 2!
    region_name: 'Region 2',
    district_id: '306 A1',
    district_name: 'District 306 A1',
    date: '2026-09-18',
    venue: 'Negombo Lagoon Pier',
    description: 'Distributed 200 dry ration packs and nutrition kits to artisanal fisherman families during off-season monsoon bans.',
    objectives: 'Immediate food security for coastal families.',
    beneficiaries: 850,
    volunteerHours: 64,
    is_phase_project: false,
    chairpersons: [{ id: 11, fName: 'Dilshan', lName: 'Fernando', mylci: '4892060' }],
    committee: [],
    incomes: [{ desc: 'Lions Matching Grant', amount: '150000' }],
    expenses: [{ desc: 'Rations Purchasing', amount: '145000' }],
    images: [],
    publicityLink: 'https://facebook.com/negomboorient/posts/relief'
  },

  // District 306 B1 - Region 1 - Club 4: Kandy Royal (OUTSIDE District 306 A1 Jurisdiction!)
  {
    id: 106,
    name: 'Hill Country Heritage Tree Planting',
    category: 'Environment & Climate',
    status: 3, // Approved
    approved_by_rc: true,
    forwarded_to_md: true,
    club_id: '4',
    club_name: 'Kandy Royal',
    clubName: 'Kandy Royal',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 B1', // District 306 B1
    district_name: 'District 306 B1',
    date: '2026-10-10',
    venue: 'Hantana Mountain Range, Kandy',
    description: 'Planted 2,500 endemic indigenous forest trees across the upper catchment slopes of Hantana.',
    objectives: 'Watershed preservation and soil stability.',
    beneficiaries: 5000,
    volunteerHours: 180,
    is_phase_project: false,
    chairpersons: [{ id: 12, fName: 'Hasitha', lName: 'Bandara', mylci: '4892070' }],
    committee: [],
    incomes: [{ desc: 'Rotary/Lions Joint Fund', amount: '200000' }],
    expenses: [{ desc: 'Saplings & Transportation', amount: '190000' }],
    images: [],
    publicityLink: 'https://facebook.com/kandyroyal/posts/hantana'
  },

  // District 306 C1 - Region 1 - Club 5: Galle Central (OUTSIDE District 306 A1 Jurisdiction!)
  {
    id: 107,
    name: 'Southern Sea Turtle Conservation',
    category: 'Environment & Climate',
    status: 3, // Approved
    approved_by_rc: true,
    forwarded_to_md: true,
    club_id: '5',
    club_name: 'Galle Central',
    clubName: 'Galle Central',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 C1', // District 306 C1
    district_name: 'District 306 C1',
    date: '2026-08-30',
    venue: 'Habaraduwa Beach Hatchery',
    description: 'Safeguarded 450 turtle eggs and released 380 olive ridley hatchlings into the Indian Ocean.',
    objectives: 'Marine biodiversity preservation.',
    beneficiaries: 1500,
    volunteerHours: 85,
    is_phase_project: false,
    chairpersons: [{ id: 13, fName: 'Sandun', lName: 'Jayasuriya', mylci: '4892080' }],
    committee: [],
    incomes: [{ desc: 'Eco Grant', amount: '75000' }],
    expenses: [{ desc: 'Hatchery Mesh & Feeding', amount: '70000' }],
    images: [],
    publicityLink: 'https://facebook.com/gallecentral/posts/turtles'
  }
];

export const MOCK_INVITATIONS = [
  {
    id: 201,
    projectName: 'Joint Blood Donation Drive 2026',
    date: '2026-11-28',
    hostClubName: 'Nawala Metro',
    created_at: '2026-11-02T10:00:00Z',
    project: {
      id: 99,
      name: 'Joint Blood Donation Drive 2026',
      clubName: 'Nawala Metro',
      club_id: '2'
    }
  }
];

export const MOCK_REPORTS = [
  // Colombo Millennium (Club 1, Region 1, District 306 A1)
  {
    id: 301,
    month: 1, // July
    monthName: 'July',
    club_id: '1',
    club_name: 'Colombo Millennium',
    clubName: 'Colombo Millennium',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 A1',
    district_name: 'District 306 A1',
    submit_on: '2026-08-12',
    meeting_date: '2026-07-12',
    place: 'Leo Youth Centre, Colombo 07',
    members_present: 24,
    guests: 6,
    minutes: 'Reviewed upcoming year budget, finalized committee appointments, chartered service contest plan.',
    bm_date: '2026-07-05',
    bm_place: 'Zoom Online Conference',
    bm_attendance: 9,
    bm_minutes: 'Approved annual financial statement, appointed project directors for Q1.',
    special_meetings: [{ desc: 'Orientation for New Inductees', date: '2026-07-18' }],
    events_attended: [{ name: 'District 306 A1 Council Installation', date: '2026-07-20', count: 12 }],
    advisor_proof: {
      type: 'email_screenshot',
      advisor_name: 'Lion Sunethra Perera, PMJF',
      consultation_method: 'Email Consultation & Board Minutes Approval',
      consultation_date: '2026-08-10',
      proof_file_name: 'advisor_consultation_email_july2026.png',
      notes: 'Consultation email sent with draft minutes and financial statement. Confirmed by Lions Club of Colombo Millennium President.'
    },
    approved_by_rc: true,
    forwarded_to_md: true,
    status: 3 // Approved
  },
  {
    id: 302,
    month: 2, // August
    monthName: 'August',
    club_id: '1',
    club_name: 'Colombo Millennium',
    clubName: 'Colombo Millennium',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 A1',
    district_name: 'District 306 A1',
    submit_on: '2026-09-21',
    meeting_date: '2026-08-09',
    place: 'Club House',
    members_present: 22,
    guests: 4,
    minutes: 'Evaluated Mega Eye Screening Camp outcomes, reviewed membership dues collection.',
    bm_date: '2026-08-02',
    bm_place: 'Board Room',
    bm_attendance: 8,
    bm_minutes: 'Sanctioned budget for September environment drive.',
    special_meetings: [],
    events_attended: [{ name: 'Multiple District Leadership Institute', date: '2026-08-16', count: 5 }],
    advisor_proof: {
      type: 'physical_signature',
      advisor_name: 'Lion K. R. Senanayake, MJF',
      consultation_method: 'Physical In-Person Meeting & Signed Minutes',
      consultation_date: '2026-09-18',
      proof_file_name: 'signed_advisor_endorsement_august2026.pdf',
      notes: 'Signed and endorsed during Monthly Lions Advisory Meeting.'
    },
    approved_by_rc: true,
    forwarded_to_md: true,
    status: 3
  },
  {
    id: 303,
    month: 3, // September
    monthName: 'September',
    club_id: '1',
    club_name: 'Colombo Millennium',
    clubName: 'Colombo Millennium',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 A1',
    district_name: 'District 306 A1',
    submit_on: '2026-10-14',
    meeting_date: '2026-09-14',
    place: 'Leo Youth Centre',
    members_present: 26,
    guests: 8,
    minutes: 'Celebrated international coastal cleanup day, presented Q1 financial audit.',
    bm_date: '2026-09-07',
    bm_place: 'Zoom',
    bm_attendance: 9,
    bm_minutes: 'Audited wallet records and verified bank balances.',
    special_meetings: [],
    events_attended: [],
    advisor_proof: {
      type: 'email_screenshot',
      advisor_name: 'Lion Sunethra Perera, PMJF',
      consultation_method: 'Email Consultation',
      consultation_date: '2026-10-12',
      proof_file_name: 'email_proof_september.png',
      notes: 'Advisor review completed via email.'
    },
    approved_by_rc: true,
    forwarded_to_md: false,
    status: 3
  },
  {
    id: 304,
    month: 4, // October
    monthName: 'October',
    club_id: '1',
    club_name: 'Colombo Millennium',
    clubName: 'Colombo Millennium',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 A1',
    district_name: 'District 306 A1',
    submit_on: '2026-11-08',
    meeting_date: '2026-10-11',
    place: 'Leo Youth Centre',
    members_present: 25,
    guests: 5,
    minutes: 'Prepared Mid-Year Review report, inducted 3 new Leos.',
    bm_date: '2026-10-04',
    bm_place: 'Board Room',
    bm_attendance: 9,
    bm_minutes: 'Reviewed membership dues and second quarter projects.',
    special_meetings: [],
    events_attended: [],
    advisor_proof: {
      type: 'email_screenshot',
      advisor_name: 'Lion Sunethra Perera, PMJF',
      consultation_method: 'Email Consultation',
      consultation_date: '2026-11-06',
      proof_file_name: 'october_advisor_email.png',
      notes: 'Reviewed by Lion Advisor via email transmission.'
    },
    approved_by_rc: false,
    forwarded_to_md: false,
    status: 2 // Pending Review
  },

  // Nawala Metro (Club 2, Region 1, District 306 A1)
  {
    id: 305,
    month: 4, // October
    monthName: 'October',
    club_id: '2',
    club_name: 'Nawala Metro',
    clubName: 'Nawala Metro',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 A1',
    district_name: 'District 306 A1',
    submit_on: '2026-11-10',
    meeting_date: '2026-10-18',
    place: 'Nawala Community Hall',
    members_present: 21,
    guests: 3,
    minutes: 'Conducted general assembly, discussed November blood drive.',
    bm_date: '2026-10-12',
    bm_place: 'Club Secretariat',
    bm_attendance: 7,
    bm_minutes: 'Budget allocation for animal welfare project.',
    special_meetings: [],
    events_attended: [],
    approved_by_rc: false,
    forwarded_to_md: false,
    status: 2 // Pending Review
  },

  // Negombo Orient (Club 3, Region 2, District 306 A1)
  {
    id: 306,
    month: 3, // September
    monthName: 'September',
    club_id: '3',
    club_name: 'Negombo Orient',
    clubName: 'Negombo Orient',
    region_id: '2', // Region 2
    region_name: 'Region 2',
    district_id: '306 A1',
    district_name: 'District 306 A1',
    submit_on: '2026-10-12',
    meeting_date: '2026-09-15',
    place: 'Negombo Town Hall',
    members_present: 20,
    guests: 4,
    minutes: 'Completed lagoon relief initiative, reviewed Q1 finance.',
    bm_date: '2026-09-08',
    bm_place: 'Board Room',
    bm_attendance: 8,
    bm_minutes: 'Approved community grant expenditure.',
    special_meetings: [],
    events_attended: [],
    approved_by_rc: true,
    forwarded_to_md: true,
    status: 3
  },

  // Kandy Royal (Club 4, Region 1, District 306 B1) - OUTSIDE District 306 A1!
  {
    id: 307,
    month: 4, // October
    monthName: 'October',
    club_id: '4',
    club_name: 'Kandy Royal',
    clubName: 'Kandy Royal',
    region_id: '1',
    region_name: 'Region 1',
    district_id: '306 B1', // District 306 B1!
    district_name: 'District 306 B1',
    submit_on: '2026-11-12',
    meeting_date: '2026-10-20',
    place: 'Kandy Club House',
    members_present: 28,
    guests: 5,
    minutes: 'Reviewed Hantana reforestation metrics and tree planting success.',
    bm_date: '2026-10-14',
    bm_place: 'Zoom',
    bm_attendance: 10,
    bm_minutes: 'Budget sanction for Hill Country projects.',
    special_meetings: [],
    events_attended: [],
    approved_by_rc: true,
    forwarded_to_md: true,
    status: 3
  }
];

export const MOCK_WALLET_RECORDS = [
  { id: 1, club_id: '1', type: 1, description: 'Balance Brought Forward (BBF)', amount: 150000, date: '2026-07-01', category: 'General' },
  { id: 2, club_id: '1', type: 2, description: 'Member Annual Dues (25 members)', amount: 75000, date: '2026-07-15', category: 'Administrative' },
  { id: 3, club_id: '1', type: 3, description: 'Multiple District Assessment Dues', amount: 35000, date: '2026-07-25', category: 'Administrative' },
  { id: 4, club_id: '1', type: 2, description: 'Sponsorship - Eye Camp Project', amount: 120000, date: '2026-08-10', category: 'Activity' },
  { id: 5, club_id: '1', type: 3, description: 'Project Direct Expense - Lenses & Drops', amount: 95000, date: '2026-08-18', category: 'Activity' },
  { id: 6, club_id: '1', type: 4, description: 'Projector & Public Address System Asset', amount: 45000, date: '2026-09-05', category: 'Asset' }
];

export const MOCK_CATEGORIES = [
  { id: 1, category: 'Health & Wellness', detail: 'Vision screenings, diabetes awareness, mental health workshops, and blood donation drives.' },
  { id: 2, category: 'Environment & Climate', detail: 'Reforestation, beach & ocean cleanups, recycling drives, and environmental sustainability initiatives.' },
  { id: 3, category: 'Hunger Relief', detail: 'Dry rations distribution, community kitchens, and nutrition programs for low-income families.' },
  { id: 4, category: 'Youth Empowerment', detail: 'Career guidance, digital literacy, entrepreneurship mentorship, and sports events.' },
  { id: 5, category: 'Childhood Cancer & Care', detail: 'Direct patient support, pediatric ward revamping, and family counseling.' }
];

export const MOCK_MEMBERS = [
  {
    id: 1,
    club_id: '1',
    club_name: 'Colombo Millennium',
    fName: 'Jevin',
    lName: 'Jayawardhana',
    email: 'jevinjayawardhana1121@gmail.com',
    contact: '+94 77 123 4567',
    mylci: '4892011',
    clubLevel: 1,
    designation: 'Club President',
    joinDate: '2021-08-15',
    status: 'Active'
  },
  {
    id: 2,
    club_id: '1',
    club_name: 'Colombo Millennium',
    fName: 'Devin',
    lName: 'Perera',
    email: 'devin.perera@leomd306.org',
    contact: '+94 71 987 6543',
    mylci: '4892012',
    clubLevel: 2,
    designation: 'Vice President',
    joinDate: '2022-03-10',
    status: 'Active'
  },
  {
    id: 3,
    club_id: '1',
    club_name: 'Colombo Millennium',
    fName: 'Kavindi',
    lName: 'Silva',
    email: 'kavindi.silva@leomd306.org',
    contact: '+94 76 555 1234',
    mylci: '4892015',
    clubLevel: 3,
    designation: 'Club Secretary',
    joinDate: '2022-07-01',
    status: 'Active'
  },
  {
    id: 4,
    club_id: '1',
    club_name: 'Colombo Millennium',
    fName: 'Sachin',
    lName: 'Fernando',
    email: 'sachin.f@leomd306.org',
    contact: '+94 70 333 4444',
    mylci: '4892020',
    clubLevel: 4,
    designation: 'Club Treasurer',
    joinDate: '2023-01-15',
    status: 'Active'
  },
  {
    id: 5,
    club_id: '1',
    club_name: 'Colombo Millennium',
    fName: 'Sunethra',
    lName: 'Perera',
    email: 'sunethra.lions@gmail.com',
    contact: '+94 77 444 8888',
    mylci: '1099234',
    clubLevel: 5,
    designation: 'Leo Advisor',
    joinDate: '2019-07-01',
    status: 'Active'
  }
];

export function getMockResponse(apiSuffix: string): any {
  const clean = apiSuffix.replace(/^\//, '');

  if (clean.startsWith('project/hosted') || clean.startsWith('projects')) {
    return { data: MOCK_PROJECTS };
  }
  if (clean.startsWith('project/contributed')) {
    return { data: [] };
  }
  if (clean.startsWith('project/organized')) {
    return { data: MOCK_PROJECTS.slice(0, 1) };
  }
  if (clean.startsWith('project/invitations')) {
    return { data: MOCK_INVITATIONS };
  }
  if (clean.startsWith('project/district') || clean.startsWith('view-club-reports')) {
    return { data: MOCK_PROJECTS };
  }
  if (clean.startsWith('project/shared') || clean.startsWith('shared-reports') || clean.startsWith('project/multipleProjects')) {
    return { data: MOCK_PROJECTS.filter(p => p.forwarded_to_md) };
  }
  if (clean.startsWith('project/view/') || clean.startsWith('project/')) {
    const id = clean.split('/').pop();
    const found = MOCK_PROJECTS.find(p => String(p.id) === String(id));
    return { data: found || MOCK_PROJECTS[0] };
  }
  if (clean.startsWith('activityReports') || clean.startsWith('report/list') || clean.startsWith('reports') || clean.startsWith('report/all') || clean.startsWith('report/regional')) {
    return { data: MOCK_REPORTS };
  }
  if (clean.startsWith('report/view/') || clean.startsWith('report/')) {
    const id = clean.split('/').pop();
    const found = MOCK_REPORTS.find(r => String(r.id) === String(id));
    return { data: found || MOCK_REPORTS[0] };
  }
  if (clean.startsWith('wallet') || clean.startsWith('clubWallet')) {
    return {
      data: {
        financial_records: MOCK_WALLET_RECORDS,
        records: MOCK_WALLET_RECORDS,
        bank_balance: 185000,
        bankBalance: 185000,
        bank_admin_balance: 65000,
        bankAdminBalance: 65000,
        dues: 25000
      }
    };
  }
  if (clean.startsWith('members')) {
    return { data: { members: MOCK_MEMBERS, dues: [] } };
  }
  if (clean.startsWith('getCategories') || clean.startsWith('categories')) {
    return { data: MOCK_CATEGORIES };
  }
  if (clean.startsWith('profile/') || clean.startsWith('myProfile')) {
    return { data: MOCK_MEMBERS[0] };
  }
  if (clean.startsWith('club/')) {
    const clubId = clean.split('/').pop();
    return {
      data: {
        id: clubId || '1',
        name: clubId === '2' ? 'Nawala Metro' : clubId === '3' ? 'Negombo Orient' : 'Colombo Millennium',
        districtName: 'District 306 A1',
        districtId: '306 A1',
        charterDate: '2015-06-20',
        activeMembers: 28,
        region: '1',
        zone: '1',
        leo_advisor: 'Lion Sunethra Perera, PMJF',
        sponsor_lions_club: 'Lions Club of Colombo Millennium'
      }
    };
  }
  if (clean.startsWith('search/')) {
    const query = clean.split('/').pop()?.toLowerCase() || '';
    return {
      data: {
        leos: MOCK_MEMBERS.filter(m => m.fName.toLowerCase().includes(query) || m.lName.toLowerCase().includes(query)),
        projects: MOCK_PROJECTS.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)),
        clubs: [{ id: 1, name: 'Colombo Millennium', districtName: 'District 306 A1' }]
      }
    };
  }

  return { data: [] };
}
