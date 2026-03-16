/**
 * SCABRA HB 5252 Credit Analyzer
 * Interactive tool for South Carolina Abandoned Buildings Revitalization Act
 * Strategic analysis of H.5252 vs. Revenue Ruling #26-1
 */

// ============================================================
// TAB NAVIGATION
// ============================================================

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
        btn.setAttribute('aria-selected', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `${tabName}-panel`);
    });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.getElementById('goToCalculator').addEventListener('click', () => switchTab('calculator'));

// ============================================================
// WIZARD — STEP NAVIGATION
// ============================================================

let currentStep = 1;

function goToStep(step) {
    // Hide all pages
    document.querySelectorAll('.wizard-page').forEach(p => p.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');

    // Update step indicators
    document.querySelectorAll('.wizard-step').forEach(s => {
        const n = parseInt(s.dataset.step);
        s.classList.remove('active', 'completed');
        if (n === step) s.classList.add('active');
        else if (n < step) s.classList.add('completed');
    });

    currentStep = step;
}

// Step 1: Property type selection
document.querySelectorAll('.property-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.property-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        card.querySelector('input[type="radio"]').checked = true;
        document.getElementById('step1Next').disabled = false;
    });
});

document.getElementById('step1Next').addEventListener('click', () => goToStep(2));
document.getElementById('step2Back').addEventListener('click', () => goToStep(1));
document.getElementById('step2Next').addEventListener('click', () => goToStep(3));
document.getElementById('step3Back').addEventListener('click', () => goToStep(2));

document.getElementById('step3Next').addEventListener('click', () => {
    const results = buildEligibilityResults();
    document.getElementById('eligibilityResults').innerHTML = results;
    goToStep(4);
});

document.getElementById('step4Back').addEventListener('click', () => goToStep(3));

// ============================================================
// ELIGIBILITY ANALYSIS
// ============================================================

function buildEligibilityResults() {
    const propertyType = document.querySelector('input[name="propertyType"]:checked')?.value;
    const vacancyPct = parseFloat(document.getElementById('vacancyPercent').value) || 0;
    const vacantYears = parseFloat(document.getElementById('vacantYears').value) || 0;
    const incomeProd = document.querySelector('input[name="incomeProd"]:checked')?.value;
    const noiStatus = document.querySelector('input[name="noiStatus"]:checked')?.value;
    const registry = document.querySelector('input[name="registry"]:checked')?.value;

    // ---- Vacancy threshold checks (same for both regimes) ----
    const meetsVacancy = vacancyPct >= 66;
    const meetsDuration = vacantYears >= 5;
    const meetsBaseThreshold = meetsVacancy && meetsDuration;

    // ---- Current law: income-producing test ----
    const incomeProducingTypes = ['commercial', 'industrial', 'mixed', 'school_private'];
    const nonIncomeTypes = {
        religious: 'Primary purpose is religious worship, not income-producing (per RR #26-1)',
        school_public: 'Public school with no tuition charged — not income-producing (per RR #26-1)',
        nonprofit: 'Non-profit community use — not operational for income-producing purposes (per RR #26-1)',
        government: 'Government/municipal use — not income-producing (per RR #26-1)'
    };

    const isIncomeProdType = incomeProducingTypes.includes(propertyType);
    const nonIncomeReason = nonIncomeTypes[propertyType];

    // Also check the income-prod answer from step 3 (overrides for "mixed" type)
    const incomeFromHistory = incomeProd === 'yes_business';
    const nonIncomeFromHistory = incomeProd && incomeProd !== 'yes_business';

    // Determine current law eligibility
    let currentLawEligible = false;
    let currentLawStatus = '';
    let currentLawNotes = [];

    if (!meetsVacancy) {
        currentLawStatus = 'Ineligible';
        currentLawNotes.push(`Vacancy rate (${vacancyPct}%) is below the required 66% threshold`);
    } else if (!meetsDuration) {
        currentLawStatus = 'Ineligible';
        currentLawNotes.push(`Duration vacant (${vacantYears} years) is below the required 5-year minimum`);
    } else if (nonIncomeReason && !incomeFromHistory) {
        currentLawStatus = 'Ineligible';
        currentLawNotes.push(nonIncomeReason);
        currentLawNotes.push('HB 5252 would remove this barrier — see HB 5252 column');
    } else if (nonIncomeFromHistory) {
        currentLawStatus = 'Likely Ineligible';
        currentLawNotes.push('Prior use appears non-income-producing per RR #26-1 disqualification criteria');
        currentLawNotes.push('Consult counsel — specific facts may affect analysis');
    } else {
        currentLawEligible = true;
        currentLawStatus = 'Likely Eligible';
        currentLawNotes.push('Meets vacancy rate and duration thresholds');
        if (registry === 'yes') currentLawNotes.push('Previously certified — streamlined re-application may be available');
    }

    // Determine HB 5252 eligibility
    let hb5252Eligible = false;
    let hb5252Status = '';
    let hb5252Notes = [];

    if (!meetsVacancy) {
        hb5252Status = 'Ineligible';
        hb5252Notes.push(`Vacancy rate (${vacancyPct}%) is below the required 66% threshold`);
    } else if (!meetsDuration) {
        hb5252Status = 'Ineligible';
        hb5252Notes.push(`Duration vacant (${vacantYears} years) is below the required 5-year minimum`);
    } else {
        hb5252Eligible = true;
        hb5252Status = 'Eligible (if enacted)';
        hb5252Notes.push('"Unoccupied" standard removes income-producing barrier');
        if (nonIncomeReason) hb5252Notes.push('Previously disqualified property type now eligible under H. 5252');
        if (registry === 'yes') hb5252Notes.push('Prior certification may accelerate new application');
    }

    // NOI analysis
    const noiMessages = {
        before_expense: { status: 'Optimal', cls: 'eligible', msg: 'Filed before first expense — fully compliant under both current law and HB 5252.' },
        before_permit: { status: 'Safe Harbor (HB 5252)', cls: 'conditional', msg: 'Filed after some expenses but before building permit. At risk under current statute for pre-NOI costs; safe harbor under HB 5252\'s building permit standard.' },
        after_permit: { status: 'Partial Risk', cls: 'conditional', msg: 'Filed after building permit issued. Costs before the NOI filing date are not eligible. Consult counsel immediately to assess salvageable expenses.' },
        not_filed: { status: 'Action Required', cls: 'ineligible', msg: 'NOI not yet filed. File before incurring the first rehabilitation expense (current law) or before obtaining the building permit (HB 5252 safe harbor).' }
    };
    const noi = noiMessages[noiStatus] || noiMessages['not_filed'];

    // Build HTML
    const currentIcon = currentLawEligible ? '✅' : (currentLawStatus.includes('Likely') ? '⚠️' : '❌');
    const hb5252Icon = hb5252Eligible ? '✅' : '❌';
    const currentClass = currentLawEligible ? 'eligible' : (currentLawStatus.includes('Likely') ? 'conditional' : 'ineligible');
    const hb5252Class = hb5252Eligible ? 'eligible' : 'ineligible';

    return `
        <div class="eligibility-result-grid">
            <div class="eligibility-result-card ${currentClass}">
                <div class="result-card-header">
                    <span class="result-status-icon">${currentIcon}</span>
                    <div>
                        <div class="result-regime-label">Current Law + RR #26-1</div>
                        <div class="result-status-text">${currentLawStatus}</div>
                    </div>
                </div>
                <div class="result-card-notes">
                    <ul>${currentLawNotes.map(n => `<li>${n}</li>`).join('')}</ul>
                </div>
            </div>
            <div class="eligibility-result-card ${hb5252Class}">
                <div class="result-card-header">
                    <span class="result-status-icon">${hb5252Icon}</span>
                    <div>
                        <div class="result-regime-label">HB 5252 (Proposed — Not Yet Law)</div>
                        <div class="result-status-text">${hb5252Status}</div>
                    </div>
                </div>
                <div class="result-card-notes">
                    <ul>${hb5252Notes.map(n => `<li>${n}</li>`).join('')}</ul>
                </div>
            </div>
        </div>
        <div class="noi-status-box">
            <h4>Notice of Intent (NOI) Status: <span style="color:var(--${noi.cls === 'eligible' ? 'accent' : noi.cls === 'ineligible' ? 'danger' : 'warning'}-color)">${noi.status}</span></h4>
            <p>${noi.msg}</p>
        </div>
        ${!meetsBaseThreshold ? `
        <div class="alert alert-warning" style="margin-top:16px">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
                <strong>Vacancy Threshold Not Met</strong>
                <p>This building does not currently satisfy the minimum vacancy requirements (66%+ unoccupied for 5+ consecutive years) under either the current statute or HB 5252. Both regimes share this threshold.</p>
            </div>
        </div>` : ''}
        ${currentLawEligible !== hb5252Eligible ? `
        <div class="alert" style="background:#fffbeb;border:1.5px solid #f6e05e;margin-top:16px">
            <div class="alert-icon">📋</div>
            <div class="alert-content">
                <strong>Strategic Note: Plan for Both Regimes</strong>
                <p>This property's eligibility differs between current law and HB 5252. Keep both scenarios in mind when finalizing your financing structure and capital stack, as the bill's passage remains pending.</p>
            </div>
        </div>` : ''}
    `;
}

// ============================================================
// CREDIT CALCULATOR
// ============================================================

document.getElementById('accountingMethod').addEventListener('change', function () {
    const warning = document.getElementById('cashMethodWarning');
    warning.classList.toggle('hidden', this.value !== 'cash');
});

document.getElementById('calculateBtn').addEventListener('click', () => {
    const totalRehab = parseFloat(document.getElementById('totalRehab').value) || 0;
    const qualifiedPct = parseFloat(document.getElementById('qualifiedPct').value) || 80;
    const buildingSize = parseFloat(document.getElementById('buildingSize').value) || 0;
    const creditRate = parseFloat(document.getElementById('creditRate').value) || 0.25;
    const method = document.getElementById('accountingMethod').value;

    if (totalRehab <= 0) {
        document.getElementById('creditResults').innerHTML = `
            <div class="alert alert-warning">
                <div class="alert-icon">⚠️</div>
                <div class="alert-content"><strong>Enter a rehabilitation cost amount</strong><p>Please provide the total estimated rehabilitation costs to calculate the credit.</p></div>
            </div>`;
        return;
    }

    const qualifiedCosts = totalRehab * (qualifiedPct / 100);
    const creditAmount = qualifiedCosts * creditRate;
    const costPerSqFt = buildingSize > 0 ? totalRehab / buildingSize : null;
    const creditPerSqFt = buildingSize > 0 ? creditAmount / buildingSize : null;
    const meets80Pct = qualifiedPct >= 80;

    const fmt = (n) => '$' + Math.round(n).toLocaleString();

    document.getElementById('creditResults').innerHTML = `
        <div class="credit-result-box">
            <div class="credit-highlight">
                <div class="credit-highlight-label">Estimated SCABRA Tax Credit</div>
                <div class="credit-highlight-amount">${fmt(creditAmount)}</div>
                <div class="credit-highlight-sub">25% of ${fmt(qualifiedCosts)} in qualified expenses</div>
            </div>
            <div class="credit-metric">
                <span class="credit-metric-label">Total Rehabilitation Costs</span>
                <span class="credit-metric-value">${fmt(totalRehab)}</span>
            </div>
            <div class="credit-metric">
                <span class="credit-metric-label">Qualified Expenses (${qualifiedPct}%)</span>
                <span class="credit-metric-value">${fmt(qualifiedCosts)}</span>
            </div>
            <div class="credit-metric">
                <span class="credit-metric-label">80% Threshold Test</span>
                <span class="credit-metric-value" style="color:${meets80Pct ? 'var(--accent-color)' : 'var(--danger-color)'}">
                    ${meets80Pct ? '✅ Meets requirement' : '❌ Below 80% — does not qualify'}
                </span>
            </div>
            <div class="credit-metric">
                <span class="credit-metric-label">Credit Rate</span>
                <span class="credit-metric-value">${(creditRate * 100).toFixed(0)}%</span>
            </div>
            ${costPerSqFt ? `
            <div class="credit-metric">
                <span class="credit-metric-label">Cost per Sq. Ft.</span>
                <span class="credit-metric-value">$${costPerSqFt.toFixed(2)}</span>
            </div>
            <div class="credit-metric">
                <span class="credit-metric-label">Credit per Sq. Ft.</span>
                <span class="credit-metric-value">$${creditPerSqFt.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="credit-metric">
                <span class="credit-metric-label">Accounting Method</span>
                <span class="credit-metric-value" style="color:${method === 'accrual' ? 'var(--accent-color)' : 'var(--danger-color)'}">
                    ${method === 'accrual' ? '✅ Accrual (compliant)' : '❌ Cash (non-compliant)'}
                </span>
            </div>
        </div>
        ${!meets80Pct ? `
        <div class="alert alert-warning" style="margin-top:16px">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
                <strong>80% Threshold Not Met</strong>
                <p>SCABRA requires that at least 80% of total project costs be qualified rehabilitation expenses. Your current estimate of ${qualifiedPct}% does not satisfy this requirement. Review your expense categories with your CPA.</p>
            </div>
        </div>` : ''}
    `;
});

// ============================================================
// CAPITAL STACK RISK ANALYZER
// ============================================================

document.querySelectorAll('input[name="collateral"]').forEach(radio => {
    radio.addEventListener('change', function () {
        document.getElementById('collateral-yes-label').classList.toggle('selected', this.value === 'yes');
        document.getElementById('collateral-no-label').classList.toggle('selected', this.value === 'no');
    });
});

document.getElementById('analyzeCapitalBtn').addEventListener('click', () => {
    const collateral = document.querySelector('input[name="collateral"]:checked')?.value;
    const loanAmt = parseFloat(document.getElementById('loanAmount').value) || 0;
    const creditAmt = parseFloat(document.getElementById('creditAmountInput').value) || 0;
    const lenderType = document.getElementById('lenderType').value;
    const resultsDiv = document.getElementById('capitalResults');
    resultsDiv.classList.remove('hidden');

    const fmt = (n) => '$' + Math.round(n).toLocaleString();
    const coverageRatio = loanAmt > 0 && creditAmt > 0 ? (creditAmt / loanAmt * 100).toFixed(1) : null;

    const lenderLabels = {
        bridge: 'Bridge Lender',
        mezzanine: 'Mezzanine Lender',
        senior: 'Senior Lender / Bank',
        private: 'Private Equity / Fund',
        cdfi: 'CDFI / Impact Lender'
    };

    const lenderRisks = {
        bridge: 'Bridge lenders rely heavily on the credit pledge as their primary risk mitigant. HB 5252 would force a fundamental restructuring of the bridge loan facility.',
        mezzanine: 'Mezzanine lenders use the credit pledge to bridge the gap between senior debt and equity. Prohibition would likely require conversion to preferred equity or subordinated participation.',
        senior: 'Senior lenders typically hold a first-position lien on real property, reducing direct exposure to the credit collateral prohibition — though underwriting may still incorporate credit realization assumptions.',
        private: 'Private equity investors would need to re-underwrite the deal absent the credit pledge, potentially requiring higher returns or larger equity checks to compensate for increased risk.',
        cdfi: 'CDFIs may have more flexibility in structuring around the prohibition due to their mission-driven mandate, though their credit committees will still require adequate security.'
    };

    if (collateral === 'yes') {
        resultsDiv.innerHTML = `
            <div class="capital-risk-result high-risk">
                <div class="capital-risk-header">
                    <span class="capital-risk-icon">🚨</span>
                    <div>
                        <div class="capital-risk-title">HIGH RISK: Credit Collateral Prohibition Applies</div>
                        <div style="font-size:0.85rem;color:var(--danger-color);margin-top:3px">If HB 5252 is enacted, this financing structure must be restructured before closing</div>
                    </div>
                </div>
                <p style="font-size:0.9rem;color:#742a2a;margin-bottom:16px">
                    Your capital stack relies on pledging SCABRA credits as collateral. HB 5252 Section 12-67-140(B)(5)(c) would make this expressly illegal. Under current law (RR #26-1), this structure remains valid — but you must prepare a contingency plan.
                </p>
                ${loanAmt || creditAmt ? `
                <div class="capital-risk-metrics">
                    ${loanAmt ? `<div class="risk-metric"><div class="risk-metric-label">Loan Amount at Risk</div><div class="risk-metric-value">${fmt(loanAmt)}</div></div>` : ''}
                    ${creditAmt ? `<div class="risk-metric"><div class="risk-metric-label">Credit Collateral Value</div><div class="risk-metric-value">${fmt(creditAmt)}</div></div>` : ''}
                    ${coverageRatio ? `<div class="risk-metric"><div class="risk-metric-label">Credit / Loan Coverage</div><div class="risk-metric-value">${coverageRatio}%</div></div>` : ''}
                    <div class="risk-metric"><div class="risk-metric-label">Lender Type</div><div class="risk-metric-value">${lenderLabels[lenderType]}</div></div>
                </div>` : ''}
                <div style="background:rgba(255,255,255,0.6);border-radius:8px;padding:14px;margin-top:16px;font-size:0.88rem;color:#742a2a;">
                    <strong>Lender-Specific Risk:</strong> ${lenderRisks[lenderType]}
                </div>
                <div style="margin-top:16px;font-size:0.88rem;color:#742a2a;background:rgba(255,255,255,0.5);padding:12px;border-radius:8px;">
                    <strong>Recommended Actions:</strong>
                    <ol style="padding-left:16px;margin-top:6px;line-height:1.7">
                        <li>Engage counsel to draft alternative security package that does not involve credit pledge</li>
                        <li>Explore preferred equity conversion with existing lender</li>
                        <li>Negotiate a pre-closing credit purchase agreement as substitute credit certainty mechanism</li>
                        <li>Monitor HB 5252 legislative calendar — add contingency language in loan commitment</li>
                    </ol>
                </div>
            </div>`;
    } else {
        resultsDiv.innerHTML = `
            <div class="capital-risk-result low-risk">
                <div class="capital-risk-header">
                    <span class="capital-risk-icon">✅</span>
                    <div>
                        <div class="capital-risk-title">LOW RISK: Structure Compatible with HB 5252</div>
                        <div style="font-size:0.85rem;color:var(--accent-color);margin-top:3px">No credit collateralization — not affected by the proposed prohibition</div>
                    </div>
                </div>
                <p style="font-size:0.9rem;color:#276749;margin-bottom:16px">
                    Your financing structure does not rely on pledging SCABRA credits as collateral. This structure is fully compatible with HB 5252's proposed prohibition and requires no restructuring if the bill is enacted.
                </p>
                ${loanAmt || creditAmt ? `
                <div class="capital-risk-metrics">
                    ${loanAmt ? `<div class="risk-metric"><div class="risk-metric-label">Loan Amount</div><div class="risk-metric-value">${fmt(loanAmt)}</div></div>` : ''}
                    ${creditAmt ? `<div class="risk-metric"><div class="risk-metric-label">Expected Credit</div><div class="risk-metric-value">${fmt(creditAmt)}</div></div>` : ''}
                    ${coverageRatio ? `<div class="risk-metric"><div class="risk-metric-label">Credit / Loan Ratio</div><div class="risk-metric-value">${coverageRatio}%</div></div>` : ''}
                    <div class="risk-metric"><div class="risk-metric-label">Lender Type</div><div class="risk-metric-value">${lenderLabels[lenderType]}</div></div>
                </div>` : ''}
                <div style="background:rgba(255,255,255,0.6);border-radius:8px;padding:14px;margin-top:16px;font-size:0.88rem;color:#276749;">
                    <strong>Lender Context:</strong> ${lenderRisks[lenderType]}
                </div>
            </div>`;
    }
});

// ============================================================
// DUE DILIGENCE CHECKLIST
// ============================================================

const DD_ITEMS = [
    {
        id: 'dd1',
        title: '1. Re-Audit Capital Stacks',
        desc: 'Review all existing and pending loan commitments. If your project relies on future SCABRA credits as collateral, prepare a "Plan B" equity structure in case HB 5252 is enacted and your lender is forced to release the collateral.',
        priority: 'critical'
    },
    {
        id: 'dd2',
        title: '2. Delay Permitting for New Sites',
        desc: 'For projects without a filed NOI, ensure the NOI is submitted before the building permit is issued to take advantage of HB 5252\'s safe harbor. Continue targeting the "first expense" benchmark to maintain compliance with current law in the interim.',
        priority: 'high'
    },
    {
        id: 'dd3',
        title: '3. Evaluate Non-Profit &amp; Religious Sites',
        desc: 'Re-screen potential project sites previously disqualified under RR #26-1 — specifically churches, public schools, community centers, and government buildings — to determine if they meet the 5-year "unoccupied" threshold under HB 5252.',
        priority: 'high'
    },
    {
        id: 'dd4',
        title: '4. Monitor the June 1, 2026 Deadline',
        desc: 'If you have an active Notice of Intent (NOI) on file, you have until June 1, 2026 to amend it under RR #26-1\'s administrative reset window. After this date, the ability to amend under current guidance expires.',
        priority: 'critical'
    },
    {
        id: 'dd5',
        title: '5. Standardize Accrual Accounting',
        desc: 'Regardless of whether HB 5252 passes, both the bill and RR #26-1 require the accrual method for calculating the 80% qualified expense threshold. Ensure all project CPAs and bookkeepers are tracking rehabilitation costs on an accrual basis.',
        priority: 'medium'
    }
];

const priorityColors = {
    critical: { bg: '#fff5f5', border: '#fc8181', badge: '#fed7d7', badgeText: '#c53030', label: 'Critical' },
    high: { bg: '#fffbeb', border: '#f6e05e', badge: '#fefcbf', badgeText: '#b7791f', label: 'High Priority' },
    medium: { bg: '#ebf4ff', border: '#90cdf4', badge: '#bee3f8', badgeText: '#2c5282', label: 'Important' }
};

function renderChecklist() {
    const container = document.getElementById('ddChecklist');
    const saved = JSON.parse(localStorage.getItem('scabra_dd_progress') || '{}');

    container.innerHTML = DD_ITEMS.map(item => {
        const isCompleted = saved[item.id]?.completed || false;
        const notes = saved[item.id]?.notes || '';
        const p = priorityColors[item.priority];
        return `
            <div class="dd-item ${isCompleted ? 'completed' : ''}" id="${item.id}-card">
                <div class="dd-item-header">
                    <div class="dd-item-number">${item.id.replace('dd', '')}</div>
                    <div class="dd-item-main">
                        <div class="dd-item-title">${item.title}</div>
                        <div class="dd-item-desc">${item.desc}</div>
                        <span style="display:inline-block;margin-top:8px;padding:2px 10px;border-radius:12px;font-size:0.72rem;font-weight:700;background:${p.badge};color:${p.badgeText}">${p.label}</span>
                    </div>
                    <div class="dd-item-actions">
                        <label class="dd-checkbox-label">
                            <input type="checkbox" data-id="${item.id}" ${isCompleted ? 'checked' : ''}> Complete
                        </label>
                        <button class="dd-notes-toggle" data-notes-id="${item.id}">+ Notes</button>
                    </div>
                </div>
                <div class="dd-notes-area ${notes ? 'open' : ''}" id="${item.id}-notes">
                    <textarea placeholder="Add notes for this item..." data-notes-id="${item.id}">${notes}</textarea>
                </div>
            </div>
        `;
    }).join('');

    // Attach listeners
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function () {
            saveProgress(this.dataset.id, 'completed', this.checked);
            document.getElementById(`${this.dataset.id}-card`).classList.toggle('completed', this.checked);
            updateDDProgress();
        });
    });

    container.querySelectorAll('.dd-notes-toggle').forEach(btn => {
        btn.addEventListener('click', function () {
            const area = document.getElementById(`${this.dataset.notesId}-notes`);
            area.classList.toggle('open');
            this.textContent = area.classList.contains('open') ? '- Notes' : '+ Notes';
        });
    });

    container.querySelectorAll('textarea').forEach(ta => {
        ta.addEventListener('input', function () {
            saveProgress(this.dataset.notesId, 'notes', this.value);
        });
    });

    updateDDProgress();
}

function saveProgress(id, field, value) {
    const saved = JSON.parse(localStorage.getItem('scabra_dd_progress') || '{}');
    if (!saved[id]) saved[id] = {};
    saved[id][field] = value;
    localStorage.setItem('scabra_dd_progress', JSON.stringify(saved));
}

function updateDDProgress() {
    const total = DD_ITEMS.length;
    const completed = document.querySelectorAll('#ddChecklist input[type="checkbox"]:checked').length;
    const pct = Math.round((completed / total) * 100);
    document.getElementById('ddProgressFill').style.width = pct + '%';
    document.getElementById('ddProgressLabel').textContent = `${pct}% (${completed} of ${total} completed)`;
}

// ============================================================
// DEADLINE COUNTDOWN
// ============================================================

function renderCountdown() {
    const deadline = new Date('2026-06-01T00:00:00');
    const now = new Date();
    const diff = deadline - now;

    const container = document.getElementById('deadlineCountdown');

    if (diff <= 0) {
        container.innerHTML = `<div class="countdown-unit" style="min-width:120px"><span class="countdown-value" style="font-size:1.2rem">EXPIRED</span><span class="countdown-label">Deadline passed</span></div>`;
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    container.innerHTML = `
        <div class="countdown-unit"><span class="countdown-value">${days}</span><span class="countdown-label">Days</span></div>
        <div class="countdown-unit"><span class="countdown-value">${hours}</span><span class="countdown-label">Hours</span></div>
        <div class="countdown-unit"><span class="countdown-value">${minutes}</span><span class="countdown-label">Minutes</span></div>
    `;
}

// ============================================================
// INIT
// ============================================================

renderChecklist();
renderCountdown();
setInterval(renderCountdown, 60000); // update every minute
