/**
 * Commercial Real Estate Closing Checklist Generator
 * Parses Purchase and Sale Agreements and generates comprehensive closing checklists
 */

// ============================================================================
// SAMPLE PSA DATA
// ============================================================================

const SAMPLE_PSA = `COMMERCIAL REAL ESTATE PURCHASE AND SALE AGREEMENT

This Purchase and Sale Agreement ("Agreement") is entered into as of January 15, 2026 (the "Effective Date"), by and between:

SELLER: Westbrook Commercial Properties, LLC, a Delaware limited liability company
Address: 1500 Market Street, Suite 3500, Philadelphia, PA 19102
Contact: Robert J. Morrison, Managing Partner
Email: rmorrison@westbrookproperties.com
Phone: (215) 555-0142

BUYER: Eastern Horizon Investments, Inc., a Maryland corporation
Address: 200 International Circle, Suite 2000, Hunt Valley, MD 21031
Contact: Sarah Chen, Vice President of Acquisitions
Email: schen@easternhorizon.com
Phone: (410) 555-0198

PROPERTY DESCRIPTION:
The property commonly known as "Commerce Center Plaza" located at:
8500 Commerce Boulevard, Baltimore, MD 21237
Legal Description: Lot 15, Block 22, Commerce Industrial Park, as recorded in Plat Book 145, Page 892, Baltimore County Records

Property Type: Class A Office Building with Ground Floor Retail
Building Size: 185,000 square feet
Land Area: 8.5 acres
Year Built: 2018
Parking: 750 structured parking spaces

PURCHASE PRICE AND PAYMENT TERMS:
Purchase Price: $47,500,000.00 (Forty-Seven Million Five Hundred Thousand Dollars)

Earnest Money Deposit: $1,425,000.00 (3% of Purchase Price)
Initial Deposit: $712,500.00 due within 5 business days of Effective Date
Additional Deposit: $712,500.00 due upon expiration of Due Diligence Period

The Earnest Money shall be held in escrow by:
First American Title Insurance Company
Escrow Officer: Jennifer Williams
Address: 100 Light Street, Suite 800, Baltimore, MD 21202
Phone: (410) 555-0234

FINANCING:
Buyer intends to obtain financing in the amount of $35,625,000.00 (75% LTV)
Lender: National Commercial Bank
Loan Officer: Michael Thompson
Loan Type: 10-year fixed rate commercial mortgage
Interest Rate: Not to exceed 6.25%
Financing Contingency Period: 45 days from Effective Date

IMPORTANT DATES AND DEADLINES:
Effective Date: January 15, 2026
Initial Deposit Due: January 22, 2026
Due Diligence Period: 60 days (expires March 16, 2026)
Additional Deposit Due: March 16, 2026
Financing Contingency Expiration: March 1, 2026
Title Commitment Due: February 14, 2026
Survey Due: February 28, 2026
Environmental Reports Due: March 1, 2026
Estoppel Certificates Due: March 9, 2026
Tenant SNDAs Due: March 9, 2026
Closing Date: April 15, 2026
Possession: At Closing

DUE DILIGENCE ITEMS:
Seller shall provide or make available to Buyer within 10 business days:
- All existing leases and lease amendments
- Rent roll (current within 30 days)
- Operating statements (trailing 3 years)
- Property tax bills (3 years)
- Utility bills (24 months)
- Service contracts and vendor agreements
- Property management agreement
- Insurance certificates and claims history
- Environmental reports (Phase I, Phase II if applicable)
- Building permits and certificates of occupancy
- Architectural and engineering drawings
- Equipment warranties and maintenance records
- Tenant correspondence files
- Accounts receivable aging report
- Capital expenditure history

TITLE AND SURVEY:
Title Company: First American Title Insurance Company
Buyer shall obtain an ALTA Owner's Policy with extended coverage
Survey: New ALTA/NSPS Land Title Survey required
Title Insurance Amount: Equal to Purchase Price

EXISTING LEASES AND TENANTS:
Major Tenants:
1. TechCorp Solutions - 45,000 SF - Expires December 2032
2. Maryland Medical Group - 28,000 SF - Expires June 2029
3. First Regional Bank - 12,000 SF - Expires March 2031
4. Various retail tenants - 15,000 SF combined

Current Occupancy: 92%
Annual Base Rent: $4,180,000
Annual CAM Recoveries: $925,000

PRORATIONS AND ADJUSTMENTS:
The following shall be prorated as of the Closing Date:
- Rent and additional rent
- Real estate taxes
- Utility charges
- Operating expenses
- Security deposits (credited to Buyer)
- Prepaid rents (credited to Buyer)

CLOSING COSTS:
Seller Responsible:
- Transfer taxes (state and local)
- Seller's attorney fees
- Existing loan payoff and release fees
- Brokerage commission

Buyer Responsible:
- Title insurance premium
- Survey costs
- Recording fees
- Buyer's attorney fees
- Loan origination and closing costs
- Due diligence expenses

BROKER:
Seller's Broker: CBRE, Inc.
Contact: David Park
Commission: 1.5% of Purchase Price

Buyer's Broker: JLL Americas
Contact: Amanda Foster
Commission: 1.5% of Purchase Price

REPRESENTATIONS AND WARRANTIES:
Seller represents and warrants that:
- Seller has full authority to execute this Agreement
- No pending litigation affecting the Property
- No environmental violations known to Seller
- All leases provided are true and complete copies
- No condemnation proceedings pending or threatened
- Property is in compliance with all zoning requirements

CONTINGENCIES:
This Agreement is contingent upon:
1. Buyer's satisfaction with due diligence investigation
2. Buyer obtaining financing on acceptable terms
3. Receipt of satisfactory estoppel certificates from tenants
4. Receipt of satisfactory subordination and non-disturbance agreements
5. No material adverse change in Property condition or tenancy

GOVERNING LAW:
This Agreement shall be governed by the laws of the State of Maryland.

SIGNATURES:
SELLER: Westbrook Commercial Properties, LLC
By: ________________________
Name: Robert J. Morrison
Title: Managing Partner
Date: January 15, 2026

BUYER: Eastern Horizon Investments, Inc.
By: ________________________
Name: Sarah Chen
Title: Vice President of Acquisitions
Date: January 15, 2026`;

// ============================================================================
// COMPREHENSIVE CRE CLOSING CHECKLIST TEMPLATE
// ============================================================================

const CHECKLIST_TEMPLATE = {
    categories: [
        {
            id: 'pre-contract',
            title: 'Pre-Contract / Letter of Intent',
            icon: '📝',
            items: [
                {
                    id: 'loi-execution',
                    title: 'Letter of Intent Executed',
                    description: 'Non-binding LOI signed by both parties outlining key terms',
                    responsible: 'Both Parties',
                    critical: false
                },
                {
                    id: 'psa-negotiation',
                    title: 'Purchase and Sale Agreement Negotiated',
                    description: 'All terms negotiated and agreed upon by both parties',
                    responsible: 'Attorneys',
                    critical: true
                },
                {
                    id: 'psa-execution',
                    title: 'PSA Fully Executed',
                    description: 'Final PSA signed by all parties with all exhibits',
                    responsible: 'Both Parties',
                    critical: true,
                    populateFrom: 'effectiveDate'
                },
                {
                    id: 'escrow-opened',
                    title: 'Escrow Opened with Title Company',
                    description: 'Escrow instructions delivered to title company',
                    responsible: 'Buyer',
                    critical: true,
                    populateFrom: 'titleCompany'
                }
            ]
        },
        {
            id: 'earnest-money',
            title: 'Earnest Money & Deposits',
            icon: '💰',
            items: [
                {
                    id: 'initial-deposit',
                    title: 'Initial Earnest Money Deposit',
                    description: 'Initial deposit delivered to escrow agent',
                    responsible: 'Buyer',
                    critical: true,
                    populateFrom: 'initialDeposit'
                },
                {
                    id: 'deposit-confirmation',
                    title: 'Deposit Receipt Confirmation',
                    description: 'Written confirmation of deposit receipt from escrow agent',
                    responsible: 'Title Company',
                    critical: true
                },
                {
                    id: 'additional-deposit',
                    title: 'Additional Deposit (if applicable)',
                    description: 'Additional deposit per PSA terms upon DD expiration',
                    responsible: 'Buyer',
                    critical: true,
                    populateFrom: 'additionalDeposit'
                },
                {
                    id: 'deposit-held',
                    title: 'Verify Deposit Held in Interest-Bearing Account',
                    description: 'Confirm escrow account details and interest allocation',
                    responsible: 'Title Company',
                    critical: false
                }
            ]
        },
        {
            id: 'due-diligence',
            title: 'Due Diligence',
            icon: '🔍',
            items: [
                {
                    id: 'dd-materials-request',
                    title: 'Due Diligence Materials Request Sent',
                    description: 'Comprehensive request for all property documents',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'dd-materials-received',
                    title: 'Due Diligence Materials Received',
                    description: 'All requested documents received from Seller',
                    responsible: 'Seller',
                    critical: true
                },
                {
                    id: 'lease-review',
                    title: 'Lease Abstract and Review',
                    description: 'All leases abstracted and reviewed by legal counsel',
                    responsible: 'Buyer Attorney',
                    critical: true,
                    populateFrom: 'tenants'
                },
                {
                    id: 'rent-roll-verification',
                    title: 'Rent Roll Verification',
                    description: 'Verify current rent roll against lease documents',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'operating-statements',
                    title: 'Operating Statements Review (3 Years)',
                    description: 'Review and analyze historical operating performance',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'tax-bill-review',
                    title: 'Property Tax Review',
                    description: 'Review property tax history and verify current assessments',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'utility-review',
                    title: 'Utility Bills Analysis',
                    description: 'Review 24-month utility history',
                    responsible: 'Buyer',
                    critical: false
                },
                {
                    id: 'service-contracts',
                    title: 'Service Contract Review',
                    description: 'Review all vendor and service contracts for assumability',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'insurance-review',
                    title: 'Insurance Review and Claims History',
                    description: 'Review current coverage and past claims',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'property-inspection',
                    title: 'Physical Property Inspection',
                    description: 'Comprehensive building inspection by qualified inspector',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'mep-inspection',
                    title: 'MEP Systems Inspection',
                    description: 'Mechanical, electrical, plumbing systems review',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'roof-inspection',
                    title: 'Roof Inspection and Report',
                    description: 'Professional roof inspection with remaining life assessment',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'ada-compliance',
                    title: 'ADA Compliance Review',
                    description: 'Americans with Disabilities Act compliance assessment',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'zoning-verification',
                    title: 'Zoning Verification',
                    description: 'Confirm property zoning and permitted uses',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'co-verification',
                    title: 'Certificate of Occupancy Verification',
                    description: 'Verify valid CO for current use',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'dd-period-expiration',
                    title: 'Due Diligence Period Expiration',
                    description: 'Deadline for DD termination or waiver',
                    responsible: 'Buyer',
                    critical: true,
                    populateFrom: 'ddExpiration'
                }
            ]
        },
        {
            id: 'environmental',
            title: 'Environmental',
            icon: '🌿',
            items: [
                {
                    id: 'phase1-ordered',
                    title: 'Phase I ESA Ordered',
                    description: 'Environmental Site Assessment ordered from qualified firm',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'phase1-received',
                    title: 'Phase I ESA Report Received',
                    description: 'Review Phase I findings and recommendations',
                    responsible: 'Environmental Consultant',
                    critical: true,
                    populateFrom: 'environmentalDue'
                },
                {
                    id: 'phase2-ordered',
                    title: 'Phase II ESA Ordered (if required)',
                    description: 'Additional investigation if RECs identified',
                    responsible: 'Buyer',
                    critical: false
                },
                {
                    id: 'phase2-received',
                    title: 'Phase II ESA Report Received',
                    description: 'Review Phase II findings and remediation requirements',
                    responsible: 'Environmental Consultant',
                    critical: false
                },
                {
                    id: 'environmental-insurance',
                    title: 'Environmental Insurance (if applicable)',
                    description: 'Pollution legal liability coverage obtained',
                    responsible: 'Buyer',
                    critical: false
                },
                {
                    id: 'asbestos-survey',
                    title: 'Asbestos Survey (if applicable)',
                    description: 'Survey for asbestos-containing materials',
                    responsible: 'Buyer',
                    critical: false
                },
                {
                    id: 'environmental-approval',
                    title: 'Environmental Condition Approved',
                    description: 'Buyer approves environmental condition of property',
                    responsible: 'Buyer',
                    critical: true
                }
            ]
        },
        {
            id: 'title-survey',
            title: 'Title & Survey',
            icon: '📋',
            items: [
                {
                    id: 'title-ordered',
                    title: 'Title Commitment Ordered',
                    description: 'Order ALTA title commitment from title company',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'title-received',
                    title: 'Title Commitment Received',
                    description: 'Review title commitment for exceptions and requirements',
                    responsible: 'Title Company',
                    critical: true,
                    populateFrom: 'titleCommitmentDue'
                },
                {
                    id: 'title-review',
                    title: 'Title Examination and Review',
                    description: 'Attorney review of all title exceptions',
                    responsible: 'Buyer Attorney',
                    critical: true
                },
                {
                    id: 'title-objections',
                    title: 'Title Objection Letter (if needed)',
                    description: 'Written objections to title defects',
                    responsible: 'Buyer Attorney',
                    critical: false
                },
                {
                    id: 'title-curative',
                    title: 'Title Curative Documents',
                    description: 'Documents to cure title objections',
                    responsible: 'Seller',
                    critical: false
                },
                {
                    id: 'survey-ordered',
                    title: 'ALTA/NSPS Survey Ordered',
                    description: 'Order new boundary and ALTA survey',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'survey-received',
                    title: 'Survey Received and Reviewed',
                    description: 'Review survey for encroachments and easements',
                    responsible: 'Surveyor',
                    critical: true,
                    populateFrom: 'surveyDue'
                },
                {
                    id: 'survey-certification',
                    title: 'Survey Certified to All Parties',
                    description: 'Survey certified to Buyer, Lender, and Title Company',
                    responsible: 'Surveyor',
                    critical: true
                },
                {
                    id: 'ucc-search',
                    title: 'UCC Search Completed',
                    description: 'Uniform Commercial Code lien search',
                    responsible: 'Title Company',
                    critical: true
                },
                {
                    id: 'judgment-search',
                    title: 'Judgment/Litigation Search',
                    description: 'Search for judgments and pending litigation',
                    responsible: 'Title Company',
                    critical: true
                },
                {
                    id: 'title-policy-issued',
                    title: 'Title Insurance Policy Issued at Closing',
                    description: 'ALTA Owner\'s Policy with extended coverage',
                    responsible: 'Title Company',
                    critical: true
                }
            ]
        },
        {
            id: 'financing',
            title: 'Financing',
            icon: '🏦',
            items: [
                {
                    id: 'loan-application',
                    title: 'Loan Application Submitted',
                    description: 'Complete loan application to lender',
                    responsible: 'Buyer',
                    critical: true,
                    populateFrom: 'lender'
                },
                {
                    id: 'term-sheet',
                    title: 'Loan Term Sheet Received',
                    description: 'Preliminary terms from lender',
                    responsible: 'Lender',
                    critical: true
                },
                {
                    id: 'loan-commitment',
                    title: 'Loan Commitment Received',
                    description: 'Formal commitment letter from lender',
                    responsible: 'Lender',
                    critical: true,
                    populateFrom: 'financingContingency'
                },
                {
                    id: 'appraisal-ordered',
                    title: 'Appraisal Ordered',
                    description: 'MAI appraisal ordered by lender',
                    responsible: 'Lender',
                    critical: true
                },
                {
                    id: 'appraisal-received',
                    title: 'Appraisal Received and Approved',
                    description: 'Appraisal meets or exceeds loan requirements',
                    responsible: 'Lender',
                    critical: true
                },
                {
                    id: 'loan-docs-prepared',
                    title: 'Loan Documents Prepared',
                    description: 'All loan documents drafted by lender\'s counsel',
                    responsible: 'Lender Attorney',
                    critical: true
                },
                {
                    id: 'loan-docs-reviewed',
                    title: 'Loan Documents Reviewed',
                    description: 'Buyer\'s attorney review of loan documents',
                    responsible: 'Buyer Attorney',
                    critical: true
                },
                {
                    id: 'rate-lock',
                    title: 'Interest Rate Locked',
                    description: 'Lock interest rate per loan terms',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'loan-funding-confirmed',
                    title: 'Loan Funding Confirmed',
                    description: 'Lender confirms funds available for closing',
                    responsible: 'Lender',
                    critical: true
                },
                {
                    id: 'financing-contingency-waiver',
                    title: 'Financing Contingency Waived/Satisfied',
                    description: 'Financing contingency deadline met',
                    responsible: 'Buyer',
                    critical: true
                }
            ]
        },
        {
            id: 'tenant-matters',
            title: 'Tenant Matters',
            icon: '🏢',
            items: [
                {
                    id: 'estoppel-requests',
                    title: 'Tenant Estoppel Requests Sent',
                    description: 'Estoppel certificates sent to all tenants',
                    responsible: 'Seller',
                    critical: true
                },
                {
                    id: 'estoppel-received',
                    title: 'Tenant Estoppel Certificates Received',
                    description: 'Signed estoppels from required percentage of tenants',
                    responsible: 'Seller',
                    critical: true,
                    populateFrom: 'estoppelsDue'
                },
                {
                    id: 'estoppel-review',
                    title: 'Estoppel Review and Approval',
                    description: 'Review estoppels for discrepancies with leases',
                    responsible: 'Buyer Attorney',
                    critical: true
                },
                {
                    id: 'snda-requests',
                    title: 'SNDA Requests Sent',
                    description: 'Subordination, Non-Disturbance, and Attornment agreements sent',
                    responsible: 'Lender',
                    critical: true
                },
                {
                    id: 'snda-received',
                    title: 'SNDAs Received from Major Tenants',
                    description: 'Signed SNDAs returned by required tenants',
                    responsible: 'Tenants',
                    critical: true,
                    populateFrom: 'sndaDue'
                },
                {
                    id: 'tenant-notices',
                    title: 'Tenant Notification Letters Prepared',
                    description: 'Notices of ownership change for tenants',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'security-deposits',
                    title: 'Security Deposit Verification',
                    description: 'Verify and account for all tenant security deposits',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'lease-assignments',
                    title: 'Lease Assignment Documentation',
                    description: 'Assignment and assumption of all leases',
                    responsible: 'Attorneys',
                    critical: true
                }
            ]
        },
        {
            id: 'closing-docs',
            title: 'Closing Documents',
            icon: '📄',
            items: [
                {
                    id: 'deed-prepared',
                    title: 'Deed Prepared',
                    description: 'Special warranty or general warranty deed drafted',
                    responsible: 'Seller Attorney',
                    critical: true
                },
                {
                    id: 'bill-of-sale',
                    title: 'Bill of Sale Prepared',
                    description: 'For personal property included in sale',
                    responsible: 'Seller Attorney',
                    critical: true
                },
                {
                    id: 'assignment-leases',
                    title: 'Assignment of Leases',
                    description: 'Assignment and assumption of all leases',
                    responsible: 'Attorneys',
                    critical: true
                },
                {
                    id: 'assignment-contracts',
                    title: 'Assignment of Contracts',
                    description: 'Assignment of service contracts, warranties, permits',
                    responsible: 'Attorneys',
                    critical: true
                },
                {
                    id: 'affidavit-title',
                    title: 'Seller\'s Affidavit of Title',
                    description: 'Seller affidavit regarding title matters',
                    responsible: 'Seller',
                    critical: true
                },
                {
                    id: 'firpta-affidavit',
                    title: 'FIRPTA Affidavit',
                    description: 'Foreign Investment in Real Property Tax Act certification',
                    responsible: 'Seller',
                    critical: true
                },
                {
                    id: '1099-form',
                    title: 'IRS Form 1099-S Information',
                    description: 'Tax reporting information for closing',
                    responsible: 'Both Parties',
                    critical: true
                },
                {
                    id: 'closing-statement',
                    title: 'Closing Statement/Settlement Statement',
                    description: 'Final settlement statement with all prorations',
                    responsible: 'Title Company',
                    critical: true
                },
                {
                    id: 'proration-schedule',
                    title: 'Proration Schedule Approved',
                    description: 'Detailed prorations for taxes, rent, CAM, etc.',
                    responsible: 'Both Parties',
                    critical: true
                },
                {
                    id: 'transfer-tax-declaration',
                    title: 'Transfer Tax Declaration',
                    description: 'State/local transfer tax forms completed',
                    responsible: 'Title Company',
                    critical: true
                },
                {
                    id: 'authority-docs',
                    title: 'Authority Documents',
                    description: 'Corporate resolutions, LLC authorizations, etc.',
                    responsible: 'Both Parties',
                    critical: true
                },
                {
                    id: 'good-standing',
                    title: 'Good Standing Certificates',
                    description: 'Entity good standing from state of formation',
                    responsible: 'Both Parties',
                    critical: true
                }
            ]
        },
        {
            id: 'insurance',
            title: 'Insurance',
            icon: '🛡️',
            items: [
                {
                    id: 'insurance-quotes',
                    title: 'Property Insurance Quotes Obtained',
                    description: 'Obtain quotes for property and liability coverage',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'insurance-binder',
                    title: 'Insurance Binder Obtained',
                    description: 'Binder for coverage effective at closing',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'lender-requirements',
                    title: 'Lender Insurance Requirements Met',
                    description: 'Coverage meets all lender requirements',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'insurance-certificate',
                    title: 'Insurance Certificate to Lender',
                    description: 'Certificate naming lender as mortgagee/loss payee',
                    responsible: 'Insurance Agent',
                    critical: true
                },
                {
                    id: 'flood-insurance',
                    title: 'Flood Insurance (if in flood zone)',
                    description: 'FEMA flood insurance if required',
                    responsible: 'Buyer',
                    critical: false
                }
            ]
        },
        {
            id: 'closing',
            title: 'Closing & Funding',
            icon: '✅',
            items: [
                {
                    id: 'closing-scheduled',
                    title: 'Closing Date Confirmed',
                    description: 'All parties confirm closing date and location',
                    responsible: 'Title Company',
                    critical: true,
                    populateFrom: 'closingDate'
                },
                {
                    id: 'wire-instructions',
                    title: 'Wire Instructions Verified',
                    description: 'Verify wire instructions via phone callback',
                    responsible: 'All Parties',
                    critical: true
                },
                {
                    id: 'final-walkthrough',
                    title: 'Final Property Walk-Through',
                    description: 'Buyer inspection immediately before closing',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'closing-funds-wired',
                    title: 'Closing Funds Wired',
                    description: 'All funds wired to escrow',
                    responsible: 'Buyer/Lender',
                    critical: true
                },
                {
                    id: 'docs-executed',
                    title: 'All Documents Executed',
                    description: 'All closing documents signed by all parties',
                    responsible: 'All Parties',
                    critical: true
                },
                {
                    id: 'deed-recorded',
                    title: 'Deed Recorded',
                    description: 'Deed and mortgage recorded with county',
                    responsible: 'Title Company',
                    critical: true
                },
                {
                    id: 'funds-disbursed',
                    title: 'Funds Disbursed',
                    description: 'All funds disbursed per settlement statement',
                    responsible: 'Title Company',
                    critical: true
                },
                {
                    id: 'keys-delivered',
                    title: 'Keys/Access Delivered',
                    description: 'All keys, access cards, codes delivered to Buyer',
                    responsible: 'Seller',
                    critical: true
                }
            ]
        },
        {
            id: 'post-closing',
            title: 'Post-Closing',
            icon: '📬',
            items: [
                {
                    id: 'recorded-docs-received',
                    title: 'Recorded Documents Received',
                    description: 'Original recorded deed and mortgage received',
                    responsible: 'Title Company',
                    critical: true
                },
                {
                    id: 'title-policy-received',
                    title: 'Title Insurance Policy Received',
                    description: 'Final title policy issued and delivered',
                    responsible: 'Title Company',
                    critical: true
                },
                {
                    id: 'tenant-notices-sent',
                    title: 'Tenant Notice Letters Sent',
                    description: 'All tenants notified of ownership change',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'vendor-notices',
                    title: 'Vendor/Contractor Notices Sent',
                    description: 'All service providers notified of ownership change',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'utility-transfers',
                    title: 'Utility Accounts Transferred',
                    description: 'All utility accounts transferred to Buyer',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'property-management',
                    title: 'Property Management Transition',
                    description: 'Property management transition completed',
                    responsible: 'Buyer',
                    critical: true
                },
                {
                    id: 'final-prorations',
                    title: 'Final Proration Reconciliation',
                    description: 'True-up of all prorations (typically 90-120 days post-closing)',
                    responsible: 'Both Parties',
                    critical: false
                },
                {
                    id: 'doc-retention',
                    title: 'Document Retention/Filing',
                    description: 'All closing documents properly filed and retained',
                    responsible: 'Buyer',
                    critical: true
                }
            ]
        }
    ]
};

// ============================================================================
// PSA PARSER CLASS
// ============================================================================

class PSAParser {
    constructor(text) {
        this.text = text;
        this.extractedData = {};
    }

    parse() {
        this.extractedData = {
            // Parties
            seller: this.extractSeller(),
            buyer: this.extractBuyer(),

            // Property
            propertyAddress: this.extractPropertyAddress(),
            propertyName: this.extractPropertyName(),
            propertyType: this.extractPropertyType(),
            buildingSize: this.extractBuildingSize(),
            landArea: this.extractLandArea(),
            yearBuilt: this.extractYearBuilt(),
            parking: this.extractParking(),

            // Financial
            purchasePrice: this.extractPurchasePrice(),
            earnestMoney: this.extractEarnestMoney(),
            initialDeposit: this.extractInitialDeposit(),
            additionalDeposit: this.extractAdditionalDeposit(),
            loanAmount: this.extractLoanAmount(),
            ltv: this.extractLTV(),
            interestRate: this.extractInterestRate(),

            // Parties - Title & Escrow
            titleCompany: this.extractTitleCompany(),
            escrowOfficer: this.extractEscrowOfficer(),
            lender: this.extractLender(),
            loanOfficer: this.extractLoanOfficer(),
            sellerBroker: this.extractSellerBroker(),
            buyerBroker: this.extractBuyerBroker(),

            // Dates
            effectiveDate: this.extractEffectiveDate(),
            initialDepositDue: this.extractInitialDepositDue(),
            ddExpiration: this.extractDDExpiration(),
            additionalDepositDue: this.extractAdditionalDepositDue(),
            financingContingency: this.extractFinancingContingency(),
            titleCommitmentDue: this.extractTitleCommitmentDue(),
            surveyDue: this.extractSurveyDue(),
            environmentalDue: this.extractEnvironmentalDue(),
            estoppelsDue: this.extractEstoppelsDue(),
            sndaDue: this.extractSNDADue(),
            closingDate: this.extractClosingDate(),

            // Tenants
            tenants: this.extractTenants(),
            occupancy: this.extractOccupancy(),
            annualRent: this.extractAnnualRent(),

            // Additional
            governingLaw: this.extractGoverningLaw()
        };

        return this.extractedData;
    }

    // Helper methods for extraction
    extractPattern(patterns, defaultValue = 'Not specified') {
        for (const pattern of patterns) {
            const match = this.text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        return defaultValue;
    }

    extractSeller() {
        const patterns = [
            /SELLER:\s*([^\n]+(?:\n[^\n]+)?)/i,
            /Seller[:\s]+([A-Z][^,\n]+(?:LLC|Inc\.|Corporation|Corp\.|LP|L\.P\.))/i
        ];
        return this.extractPattern(patterns);
    }

    extractBuyer() {
        const patterns = [
            /BUYER:\s*([^\n]+(?:\n[^\n]+)?)/i,
            /Buyer[:\s]+([A-Z][^,\n]+(?:LLC|Inc\.|Corporation|Corp\.|LP|L\.P\.))/i
        ];
        return this.extractPattern(patterns);
    }

    extractPropertyAddress() {
        const patterns = [
            /(?:located at|property address)[:\s]*\n?\s*([0-9]+[^\n,]+(?:,\s*[A-Z]{2}\s+\d{5})?)/i,
            /([0-9]+\s+[A-Za-z]+\s+(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Way|Circle|Cir)[^\n,]+(?:,\s*[A-Z]{2}\s+\d{5})?)/i
        ];
        return this.extractPattern(patterns);
    }

    extractPropertyName() {
        const patterns = [
            /(?:commonly known as|property name)[:\s]*"?([^"]+)"/i,
            /(?:commonly known as|property name)[:\s]*([^\n]+)/i
        ];
        return this.extractPattern(patterns);
    }

    extractPropertyType() {
        const patterns = [
            /Property Type[:\s]*([^\n]+)/i,
            /(?:Class [A-C])\s+([^\n]+)/i
        ];
        return this.extractPattern(patterns);
    }

    extractBuildingSize() {
        const patterns = [
            /Building Size[:\s]*([0-9,]+\s*(?:square feet|sf|sq\.?\s*ft\.?))/i,
            /([0-9,]+)\s*(?:square feet|SF|sq\.?\s*ft\.?)/i
        ];
        return this.extractPattern(patterns);
    }

    extractLandArea() {
        const patterns = [
            /Land Area[:\s]*([0-9.]+\s*acres?)/i,
            /([0-9.]+)\s*acres?/i
        ];
        return this.extractPattern(patterns);
    }

    extractYearBuilt() {
        const patterns = [
            /Year Built[:\s]*(\d{4})/i,
            /(?:built|constructed)\s+(?:in\s+)?(\d{4})/i
        ];
        return this.extractPattern(patterns);
    }

    extractParking() {
        const patterns = [
            /Parking[:\s]*([^\n]+)/i,
            /([0-9,]+)\s*(?:structured\s+)?parking\s*spaces?/i
        ];
        return this.extractPattern(patterns);
    }

    extractPurchasePrice() {
        const patterns = [
            /Purchase Price[:\s]*\$?([0-9,]+(?:\.\d{2})?)/i,
            /\$([0-9,]+(?:\.\d{2})?)\s*\([^)]*(?:Million|Thousand)/i
        ];
        return this.extractPattern(patterns);
    }

    extractEarnestMoney() {
        const patterns = [
            /Earnest Money(?:\s+Deposit)?[:\s]*\$?([0-9,]+(?:\.\d{2})?)/i
        ];
        return this.extractPattern(patterns);
    }

    extractInitialDeposit() {
        const patterns = [
            /Initial Deposit[:\s]*\$?([0-9,]+(?:\.\d{2})?)/i
        ];
        return this.extractPattern(patterns);
    }

    extractAdditionalDeposit() {
        const patterns = [
            /Additional Deposit[:\s]*\$?([0-9,]+(?:\.\d{2})?)/i
        ];
        return this.extractPattern(patterns);
    }

    extractLoanAmount() {
        const patterns = [
            /financing\s+(?:in\s+the\s+amount\s+of\s+)?\$?([0-9,]+(?:\.\d{2})?)/i,
            /Loan Amount[:\s]*\$?([0-9,]+(?:\.\d{2})?)/i
        ];
        return this.extractPattern(patterns);
    }

    extractLTV() {
        const patterns = [
            /(\d+(?:\.\d+)?)\s*%\s*LTV/i,
            /LTV[:\s]*(\d+(?:\.\d+)?)\s*%/i
        ];
        return this.extractPattern(patterns);
    }

    extractInterestRate() {
        const patterns = [
            /Interest Rate[:\s]*(?:Not to exceed\s+)?(\d+(?:\.\d+)?)\s*%/i,
            /(\d+(?:\.\d+)?)\s*%\s*(?:fixed|interest)/i
        ];
        return this.extractPattern(patterns);
    }

    extractTitleCompany() {
        const patterns = [
            /(?:Title Company|escrow.*?by)[:\s]*\n?\s*([A-Z][^\n]+(?:Title|Insurance)[^\n]*)/i
        ];
        return this.extractPattern(patterns);
    }

    extractEscrowOfficer() {
        const patterns = [
            /Escrow Officer[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+)/i
        ];
        return this.extractPattern(patterns);
    }

    extractLender() {
        const patterns = [
            /Lender[:\s]*([A-Z][^\n]+(?:Bank|Capital|Funding|Financial)[^\n]*)/i
        ];
        return this.extractPattern(patterns);
    }

    extractLoanOfficer() {
        const patterns = [
            /Loan Officer[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+)/i
        ];
        return this.extractPattern(patterns);
    }

    extractSellerBroker() {
        const patterns = [
            /Seller'?s?\s+Broker[:\s]*([^\n]+)/i
        ];
        return this.extractPattern(patterns);
    }

    extractBuyerBroker() {
        const patterns = [
            /Buyer'?s?\s+Broker[:\s]*([^\n]+)/i
        ];
        return this.extractPattern(patterns);
    }

    extractEffectiveDate() {
        const patterns = [
            /Effective Date[:\s]*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
            /as of\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i
        ];
        return this.extractPattern(patterns);
    }

    extractInitialDepositDue() {
        const patterns = [
            /Initial Deposit[^:]*Due[:\s]*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i
        ];
        return this.extractPattern(patterns);
    }

    extractDDExpiration() {
        const patterns = [
            /Due Diligence Period[:\s]*(\d+)\s*days[^(]*\(expires?\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})\)/i,
            /Due Diligence[^:]*(?:expires?|expiration)[:\s]*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i
        ];
        const match = this.text.match(patterns[0]);
        if (match) return match[2];
        return this.extractPattern([patterns[1]]);
    }

    extractAdditionalDepositDue() {
        const patterns = [
            /Additional Deposit[^:]*Due[:\s]*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i
        ];
        return this.extractPattern(patterns);
    }

    extractFinancingContingency() {
        const patterns = [
            /Financing Contingency[^:]*(?:Expiration|Period)[:\s]*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
            /Financing Contingency[^:]*:\s*(\d+)\s*days/i
        ];
        return this.extractPattern(patterns);
    }

    extractTitleCommitmentDue() {
        const patterns = [
            /Title Commitment[^:]*Due[:\s]*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i
        ];
        return this.extractPattern(patterns);
    }

    extractSurveyDue() {
        const patterns = [
            /Survey[^:]*Due[:\s]*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i
        ];
        return this.extractPattern(patterns);
    }

    extractEnvironmentalDue() {
        const patterns = [
            /Environmental[^:]*Due[:\s]*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i
        ];
        return this.extractPattern(patterns);
    }

    extractEstoppelsDue() {
        const patterns = [
            /Estoppel[^:]*Due[:\s]*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i
        ];
        return this.extractPattern(patterns);
    }

    extractSNDADue() {
        const patterns = [
            /(?:SNDA|Tenant SNDA)[^:]*Due[:\s]*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i
        ];
        return this.extractPattern(patterns);
    }

    extractClosingDate() {
        const patterns = [
            /Closing Date[:\s]*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i
        ];
        return this.extractPattern(patterns);
    }

    extractTenants() {
        const tenants = [];
        const tenantPattern = /\d+\.\s*([A-Z][^-\n]+)\s*-\s*([0-9,]+)\s*SF\s*-\s*(?:Expires?\s+)?([A-Z][a-z]+\s+\d{4})/gi;
        let match;
        while ((match = tenantPattern.exec(this.text)) !== null) {
            tenants.push({
                name: match[1].trim(),
                size: match[2].replace(/,/g, ''),
                expiration: match[3]
            });
        }
        return tenants.length > 0 ? tenants : [];
    }

    extractOccupancy() {
        const patterns = [
            /(?:Current\s+)?Occupancy[:\s]*(\d+(?:\.\d+)?)\s*%/i
        ];
        return this.extractPattern(patterns);
    }

    extractAnnualRent() {
        const patterns = [
            /Annual\s+(?:Base\s+)?Rent[:\s]*\$?([0-9,]+(?:\.\d{2})?)/i
        ];
        return this.extractPattern(patterns);
    }

    extractGoverningLaw() {
        const patterns = [
            /governed by the laws of[^.]*State of\s+([A-Za-z]+)/i
        ];
        return this.extractPattern(patterns);
    }
}

// ============================================================================
// CHECKLIST MANAGER CLASS
// ============================================================================

class ChecklistManager {
    constructor(extractedData) {
        this.extractedData = extractedData;
        this.checklist = JSON.parse(JSON.stringify(CHECKLIST_TEMPLATE));
        this.itemStates = {};
        this.itemNotes = {};
    }

    populateChecklist() {
        // Add deadlines and context to items based on extracted data
        this.checklist.categories.forEach(category => {
            category.items.forEach(item => {
                // Initialize state
                this.itemStates[item.id] = {
                    completed: false,
                    na: false
                };

                // Populate deadline based on PSA data
                if (item.populateFrom && this.extractedData[item.populateFrom]) {
                    const value = this.extractedData[item.populateFrom];
                    if (typeof value === 'string' && value !== 'Not specified') {
                        item.deadline = value;
                    }
                }

                // Add tenant context
                if (item.id === 'lease-review' && this.extractedData.tenants && this.extractedData.tenants.length > 0) {
                    item.description += ` (${this.extractedData.tenants.length} tenants)`;
                }
            });
        });

        return this.checklist;
    }

    toggleItemComplete(itemId) {
        if (!this.itemStates[itemId]) {
            this.itemStates[itemId] = { completed: false, na: false };
        }
        this.itemStates[itemId].completed = !this.itemStates[itemId].completed;
        if (this.itemStates[itemId].completed) {
            this.itemStates[itemId].na = false;
        }
        return this.itemStates[itemId];
    }

    toggleItemNA(itemId) {
        if (!this.itemStates[itemId]) {
            this.itemStates[itemId] = { completed: false, na: false };
        }
        this.itemStates[itemId].na = !this.itemStates[itemId].na;
        if (this.itemStates[itemId].na) {
            this.itemStates[itemId].completed = false;
        }
        return this.itemStates[itemId];
    }

    setItemNotes(itemId, notes) {
        this.itemNotes[itemId] = notes;
    }

    getItemNotes(itemId) {
        return this.itemNotes[itemId] || '';
    }

    getProgress() {
        let completed = 0;
        let pending = 0;
        let na = 0;
        let total = 0;

        this.checklist.categories.forEach(category => {
            category.items.forEach(item => {
                total++;
                const state = this.itemStates[item.id] || { completed: false, na: false };
                if (state.completed) {
                    completed++;
                } else if (state.na) {
                    na++;
                } else {
                    pending++;
                }
            });
        });

        const applicableTotal = total - na;
        const percent = applicableTotal > 0 ? Math.round((completed / applicableTotal) * 100) : 0;

        return { completed, pending, na, total, percent };
    }

    getCategoryProgress(categoryId) {
        const category = this.checklist.categories.find(c => c.id === categoryId);
        if (!category) return { completed: 0, total: 0 };

        let completed = 0;
        let total = category.items.length;

        category.items.forEach(item => {
            const state = this.itemStates[item.id] || { completed: false, na: false };
            if (state.completed || state.na) {
                completed++;
            }
        });

        return { completed, total };
    }

    saveToLocalStorage() {
        const data = {
            itemStates: this.itemStates,
            itemNotes: this.itemNotes,
            extractedData: this.extractedData,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('creChecklistData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('creChecklistData');
        if (saved) {
            const data = JSON.parse(saved);
            this.itemStates = data.itemStates || {};
            this.itemNotes = data.itemNotes || {};
            return true;
        }
        return false;
    }
}

// ============================================================================
// UI CONTROLLER CLASS
// ============================================================================

class UIController {
    constructor() {
        this.parser = null;
        this.checklistManager = null;
        this.currentEditItemId = null;
        this.extractedData = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTabChange(e));
        });

        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => this.handleGenerate());

        // Sample PSA button
        document.getElementById('loadSampleBtn').addEventListener('click', () => this.loadSamplePSA());

        // File upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Navigation buttons
        document.getElementById('backToInputBtn')?.addEventListener('click', () => this.showSection('psaInputSection'));
        document.getElementById('proceedToChecklistBtn')?.addEventListener('click', () => this.showSection('checklistSection'));
        document.getElementById('backToReviewBtn')?.addEventListener('click', () => this.showSection('extractedInfoSection'));
        document.getElementById('editExtractedBtn')?.addEventListener('click', () => this.showEditModal());

        // Expand/Collapse buttons
        document.getElementById('expandAllBtn')?.addEventListener('click', () => this.expandAllCategories());
        document.getElementById('collapseAllBtn')?.addEventListener('click', () => this.collapseAllCategories());

        // Action buttons
        document.getElementById('saveProgressBtn')?.addEventListener('click', () => this.saveProgress());
        document.getElementById('printChecklistBtn')?.addEventListener('click', () => window.print());
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => this.exportToPdf());

        // Modal buttons
        document.getElementById('closeModalBtn')?.addEventListener('click', () => this.hideModal('editModal'));
        document.getElementById('cancelEditBtn')?.addEventListener('click', () => this.hideModal('editModal'));
        document.getElementById('saveEditBtn')?.addEventListener('click', () => this.saveEditedData());

        document.getElementById('closeNotesModalBtn')?.addEventListener('click', () => this.hideModal('notesModal'));
        document.getElementById('cancelNotesBtn')?.addEventListener('click', () => this.hideModal('notesModal'));
        document.getElementById('saveNotesBtn')?.addEventListener('click', () => this.saveNotes());
    }

    handleTabChange(e) {
        const tabId = e.target.dataset.tab;

        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    processFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('psaText').value = e.target.result;
            document.getElementById('filePreview').innerHTML = `
                <p><strong>File loaded:</strong> ${file.name}</p>
                <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
            `;
            document.getElementById('filePreview').classList.remove('hidden');

            // Switch to paste tab to show content
            document.querySelector('.tab-btn[data-tab="paste"]').click();
        };
        reader.readAsText(file);
    }

    loadSamplePSA() {
        document.getElementById('psaText').value = SAMPLE_PSA;
        document.querySelector('.tab-btn[data-tab="paste"]').click();
    }

    handleGenerate() {
        const psaText = document.getElementById('psaText').value.trim();

        if (!psaText) {
            alert('Please enter or upload a Purchase and Sale Agreement first.');
            return;
        }

        // Parse PSA
        this.parser = new PSAParser(psaText);
        this.extractedData = this.parser.parse();

        // Display extracted information
        this.displayExtractedInfo();

        // Show extracted info section
        this.showSection('extractedInfoSection');
    }

    displayExtractedInfo() {
        const grid = document.getElementById('extractedInfoGrid');
        grid.innerHTML = '';

        const infoFields = [
            { label: 'Seller', key: 'seller' },
            { label: 'Buyer', key: 'buyer' },
            { label: 'Property Name', key: 'propertyName' },
            { label: 'Property Address', key: 'propertyAddress' },
            { label: 'Property Type', key: 'propertyType' },
            { label: 'Building Size', key: 'buildingSize' },
            { label: 'Purchase Price', key: 'purchasePrice', format: 'currency', highlight: true },
            { label: 'Earnest Money', key: 'earnestMoney', format: 'currency' },
            { label: 'Loan Amount', key: 'loanAmount', format: 'currency' },
            { label: 'Lender', key: 'lender' },
            { label: 'Title Company', key: 'titleCompany' },
            { label: 'Effective Date', key: 'effectiveDate' },
            { label: 'Due Diligence Expiration', key: 'ddExpiration', highlight: true },
            { label: 'Financing Contingency', key: 'financingContingency' },
            { label: 'Closing Date', key: 'closingDate', highlight: true },
            { label: 'Occupancy', key: 'occupancy' }
        ];

        infoFields.forEach(field => {
            let value = this.extractedData[field.key];

            if (field.format === 'currency' && value && value !== 'Not specified') {
                value = '$' + parseFloat(value.replace(/,/g, '')).toLocaleString();
            }

            const card = document.createElement('div');
            card.className = `info-card${field.highlight ? ' highlight' : ''}`;
            card.innerHTML = `
                <h4>${field.label}</h4>
                <p>${value || 'Not specified'}</p>
            `;
            grid.appendChild(card);
        });

        // Add tenants if available
        if (this.extractedData.tenants && this.extractedData.tenants.length > 0) {
            const tenantsCard = document.createElement('div');
            tenantsCard.className = 'info-card';
            tenantsCard.style.gridColumn = '1 / -1';

            let tenantsHtml = '<h4>Major Tenants</h4><ul style="list-style: none; padding: 0;">';
            this.extractedData.tenants.forEach(tenant => {
                tenantsHtml += `<li style="margin-bottom: 5px;">${tenant.name} - ${parseInt(tenant.size).toLocaleString()} SF - Exp: ${tenant.expiration}</li>`;
            });
            tenantsHtml += '</ul>';

            tenantsCard.innerHTML = tenantsHtml;
            grid.appendChild(tenantsCard);
        }
    }

    showSection(sectionId) {
        ['psaInputSection', 'extractedInfoSection', 'checklistSection'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');

        if (sectionId === 'checklistSection') {
            this.initializeChecklist();
        }
    }

    initializeChecklist() {
        this.checklistManager = new ChecklistManager(this.extractedData);
        this.checklistManager.populateChecklist();

        this.renderTransactionSummary();
        this.renderChecklist();
        this.updateProgress();
    }

    renderTransactionSummary() {
        const summary = document.getElementById('transactionSummary');

        const price = this.extractedData.purchasePrice !== 'Not specified'
            ? '$' + parseFloat(this.extractedData.purchasePrice.replace(/,/g, '')).toLocaleString()
            : 'N/A';

        summary.innerHTML = `
            <div class="summary-item">
                <div class="label">Property</div>
                <div class="value">${this.extractedData.propertyName || 'N/A'}</div>
            </div>
            <div class="summary-item">
                <div class="label">Purchase Price</div>
                <div class="value">${price}</div>
            </div>
            <div class="summary-item">
                <div class="label">Closing Date</div>
                <div class="value">${this.extractedData.closingDate || 'TBD'}</div>
            </div>
            <div class="summary-item">
                <div class="label">DD Expires</div>
                <div class="value">${this.extractedData.ddExpiration || 'TBD'}</div>
            </div>
        `;
    }

    renderChecklist() {
        const container = document.getElementById('checklistContainer');
        container.innerHTML = '';

        this.checklistManager.checklist.categories.forEach(category => {
            const categoryEl = this.createCategoryElement(category);
            container.appendChild(categoryEl);
        });
    }

    createCategoryElement(category) {
        const progress = this.checklistManager.getCategoryProgress(category.id);

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'checklist-category';
        categoryDiv.id = `category-${category.id}`;

        categoryDiv.innerHTML = `
            <div class="category-header" data-category="${category.id}">
                <div class="category-title">
                    <span class="category-icon">${category.icon}</span>
                    <h3>${category.title}</h3>
                </div>
                <div class="category-progress">
                    <span class="category-count">${progress.completed}/${progress.total}</span>
                    <span class="expand-icon">▼</span>
                </div>
            </div>
            <div class="category-items" id="items-${category.id}">
                ${category.items.map(item => this.createItemHTML(item)).join('')}
            </div>
        `;

        // Add click handler for category header
        const header = categoryDiv.querySelector('.category-header');
        header.addEventListener('click', () => this.toggleCategory(category.id));

        // Add click handlers for items
        categoryDiv.querySelectorAll('.item-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const itemId = e.target.dataset.itemId;
                this.handleItemToggle(itemId);
            });
        });

        categoryDiv.querySelectorAll('.na-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                this.handleNAToggle(itemId);
            });
        });

        categoryDiv.querySelectorAll('.notes-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                this.showNotesModal(itemId);
            });
        });

        return categoryDiv;
    }

    createItemHTML(item) {
        const state = this.checklistManager.itemStates[item.id] || { completed: false, na: false };

        let stateClass = '';
        if (state.completed) stateClass = 'completed';
        else if (state.na) stateClass = 'na';

        let metaTags = '';
        if (item.responsible) {
            metaTags += `<span class="item-tag responsible">${item.responsible}</span>`;
        }
        if (item.deadline) {
            metaTags += `<span class="item-tag deadline">Due: ${item.deadline}</span>`;
        }
        if (item.critical) {
            metaTags += `<span class="item-tag critical">Critical</span>`;
        }

        return `
            <div class="checklist-item ${stateClass}" id="item-${item.id}">
                <div class="item-checkbox">
                    <input type="checkbox"
                           data-item-id="${item.id}"
                           ${state.completed ? 'checked' : ''}
                           ${state.na ? 'disabled' : ''}>
                </div>
                <div class="item-content">
                    <div class="item-title">${item.title}</div>
                    <div class="item-description">${item.description}</div>
                    <div class="item-meta">${metaTags}</div>
                </div>
                <div class="item-actions">
                    <button class="item-action-btn notes-btn" data-item-id="${item.id}">Notes</button>
                    <button class="item-action-btn na-btn ${state.na ? 'active' : ''}" data-item-id="${item.id}">N/A</button>
                </div>
            </div>
        `;
    }

    toggleCategory(categoryId) {
        const header = document.querySelector(`[data-category="${categoryId}"]`);
        const items = document.getElementById(`items-${categoryId}`);

        header.classList.toggle('expanded');
        items.classList.toggle('expanded');
    }

    expandAllCategories() {
        document.querySelectorAll('.category-header').forEach(header => {
            header.classList.add('expanded');
        });
        document.querySelectorAll('.category-items').forEach(items => {
            items.classList.add('expanded');
        });
    }

    collapseAllCategories() {
        document.querySelectorAll('.category-header').forEach(header => {
            header.classList.remove('expanded');
        });
        document.querySelectorAll('.category-items').forEach(items => {
            items.classList.remove('expanded');
        });
    }

    handleItemToggle(itemId) {
        const state = this.checklistManager.toggleItemComplete(itemId);
        this.updateItemDisplay(itemId, state);
        this.updateProgress();
        this.updateCategoryProgress(itemId);
    }

    handleNAToggle(itemId) {
        const state = this.checklistManager.toggleItemNA(itemId);
        this.updateItemDisplay(itemId, state);
        this.updateProgress();
        this.updateCategoryProgress(itemId);
    }

    updateItemDisplay(itemId, state) {
        const itemEl = document.getElementById(`item-${itemId}`);
        const checkbox = itemEl.querySelector('input[type="checkbox"]');
        const naBtn = itemEl.querySelector('.na-btn');

        itemEl.classList.remove('completed', 'na');
        if (state.completed) {
            itemEl.classList.add('completed');
            checkbox.checked = true;
            checkbox.disabled = false;
            naBtn.classList.remove('active');
        } else if (state.na) {
            itemEl.classList.add('na');
            checkbox.checked = false;
            checkbox.disabled = true;
            naBtn.classList.add('active');
        } else {
            checkbox.checked = false;
            checkbox.disabled = false;
            naBtn.classList.remove('active');
        }
    }

    updateCategoryProgress(itemId) {
        // Find which category this item belongs to
        for (const category of this.checklistManager.checklist.categories) {
            const item = category.items.find(i => i.id === itemId);
            if (item) {
                const progress = this.checklistManager.getCategoryProgress(category.id);
                const countEl = document.querySelector(`[data-category="${category.id}"] .category-count`);
                if (countEl) {
                    countEl.textContent = `${progress.completed}/${progress.total}`;
                }
                break;
            }
        }
    }

    updateProgress() {
        const progress = this.checklistManager.getProgress();

        document.getElementById('progressPercent').textContent = `${progress.percent}%`;
        document.getElementById('progressFill').style.width = `${progress.percent}%`;
        document.getElementById('completedCount').textContent = progress.completed;
        document.getElementById('pendingCount').textContent = progress.pending;
        document.getElementById('naCount').textContent = progress.na;
    }

    showNotesModal(itemId) {
        this.currentEditItemId = itemId;
        const notes = this.checklistManager.getItemNotes(itemId);
        document.getElementById('itemNotes').value = notes;
        document.getElementById('notesModal').classList.remove('hidden');
    }

    saveNotes() {
        const notes = document.getElementById('itemNotes').value;
        this.checklistManager.setItemNotes(this.currentEditItemId, notes);
        this.hideModal('notesModal');
    }

    showEditModal() {
        const body = document.getElementById('editModalBody');
        body.innerHTML = '';

        const fields = [
            { key: 'propertyName', label: 'Property Name' },
            { key: 'purchasePrice', label: 'Purchase Price' },
            { key: 'closingDate', label: 'Closing Date' },
            { key: 'ddExpiration', label: 'Due Diligence Expiration' },
            { key: 'financingContingency', label: 'Financing Contingency' },
            { key: 'titleCompany', label: 'Title Company' },
            { key: 'lender', label: 'Lender' }
        ];

        fields.forEach(field => {
            const value = this.extractedData[field.key] || '';
            body.innerHTML += `
                <div class="form-group">
                    <label for="edit-${field.key}">${field.label}</label>
                    <input type="text" id="edit-${field.key}" value="${value}">
                </div>
            `;
        });

        document.getElementById('editModal').classList.remove('hidden');
    }

    saveEditedData() {
        const fields = ['propertyName', 'purchasePrice', 'closingDate', 'ddExpiration',
                       'financingContingency', 'titleCompany', 'lender'];

        fields.forEach(key => {
            const input = document.getElementById(`edit-${key}`);
            if (input) {
                this.extractedData[key] = input.value;
            }
        });

        this.displayExtractedInfo();
        this.hideModal('editModal');

        if (this.checklistManager) {
            this.checklistManager.extractedData = this.extractedData;
            this.renderTransactionSummary();
        }
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    saveProgress() {
        if (this.checklistManager) {
            this.checklistManager.saveToLocalStorage();
            alert('Progress saved successfully!');
        }
    }

    exportToPdf() {
        // For a full implementation, you would use a library like jsPDF
        // For now, we'll use the print functionality
        alert('To export as PDF, use your browser\'s "Print to PDF" feature in the print dialog.');
        window.print();
    }
}

// ============================================================================
// INITIALIZE APPLICATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    window.app = new UIController();
});
