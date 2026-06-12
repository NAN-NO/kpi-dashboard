import re
import sys

def main():
    path = r'd:\dashboard_cg_kpi_gas-1.html\kpi-dashboard-app\public\dashboard.html'
    try:
        with open(path, 'r', encoding='utf-8-sig') as f:
            html = f.read()
    except Exception as e:
        with open(path, 'r', encoding='utf-16') as f:
            html = f.read()

    # 1. Remove buttons
    html = re.sub(r'<div id="apiStatusBadge".*?</div>', '', html, flags=re.DOTALL)
    html = re.sub(r'<button onclick="loadFromSheet\(\)".*?</button>', '', html, flags=re.DOTALL)
    html = re.sub(r'<button onclick="handleManualSave\(\)".*?</button>', '', html, flags=re.DOTALL)
    html = re.sub(r'<button onclick="openGasUrlModal\(\)".*?</button>', '', html, flags=re.DOTALL)
    html = re.sub(r'<div id="gasUrlModal".*?<!-- ══════════════════════════════════════════════ -->\s*<!--  Header', '<!-- ══════════════════════════════════════════════ -->\n    <!--  Header', html, flags=re.DOTALL)
    
    # 2. Modify loadInitialData()
    new_load = """
    function loadInitialData() {
        window.parent.postMessage({ type: 'READY' }, '*');
        
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'INIT_DATA') {
                appData = event.data.payload;
                window.appSession = event.data.session;
                initFilters();
                updateKpiSelector();
                calculateOverviewDashboard();
                handleKpiChange();
            } else if (event.data && event.data.type === 'SESSION_CHANGE') {
                window.appSession = event.data.session;
                handleKpiChange();
            }
        });
    }
    """
    html = re.sub(r'function loadInitialData\(\) \{.*?(?=// ─────────────────────────────────────────────────────────────────\s*// 5\. DATA PERSISTENCE)', new_load, html, flags=re.DOTALL)

    # Remove initApp call from the end (since INIT_DATA will trigger init functions)
    # The original file has `initApp();` at the end
    # Actually wait, `initApp()` sets up event listeners, so we shouldn't remove it. 
    # But `initApp` originally calls `loadInitialData()` then `initFilters()`, etc.
    # We should let `initApp` call `loadInitialData()`, but remove the subsequent calls from `initApp` since `INIT_DATA` will do it.
    new_initApp = """
    function initApp() {
        // init data
        loadInitialData();
        
        // setup event listeners
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
            }
        });
    }
    """
    html = re.sub(r'function initApp\(\) \{.*?(?=initApp\(\);)', new_initApp, html, flags=re.DOTALL)

    # 3. Monthly Table input check
    # In `buildInputTable(kpi)`: `class="w-11 text-center...` -> add `readonly` if no session
    readonly_attr = '${window.appSession ? "" : "disabled style=\\\"background:#f1f5f9; cursor:not-allowed;\\\""}'
    html = html.replace('class="w-11 text-center border border-slate-200', f'{readonly_attr} class="w-11 text-center border border-slate-200')

    # 4. Save data via postMessage
    new_handleTableInput = """
    function handleTableInput(input) {
        if (!window.appSession) {
            alert('ต้องเข้าสู่ระบบเพื่อแก้ไขข้อมูล');
            return;
        }
        const mIdx = parseInt(input.getAttribute('data-month'));
        const type = input.getAttribute('data-type');
        const val  = input.value !== '' ? parseFloat(input.value) : null;

        appData[currentKpiIndex].monthlyData[mIdx][type] = val;
        
        // send to parent
        window.parent.postMessage({
            type: 'SAVE_DATA',
            action: 'UPDATE_MONTHLY',
            payload: appData[currentKpiIndex],
            detail: { monthIdx: mIdx, type, value: val }
        }, '*');

        const kpi = appData[currentKpiIndex];
        _refreshTableTotals(kpi);
        _refreshRateCellAtMonth(kpi, mIdx);
        updateYtdCard(kpi);
        buildQuarterlySummary(kpi);
        renderCharts();
        renderPctDonut();
    }
    """
    html = re.sub(r'function handleTableInput\(input\) \{.*?(?=/\*\* อัปเดตช่องสะสม)', new_handleTableInput, html, flags=re.DOTALL)

    # 5. Quarterly summary 
    # Remove debounceSaveAnalysis
    html = re.sub(r'function debounceSaveAnalysis.*?\}', '', html, flags=re.DOTALL)
    
    new_handleAnalysisInput = """
    function handleAnalysisInput(qIdx) {
        autoResizeTextarea(document.getElementById(`txtAnalysisQ${qIdx}`));
    }
    
    function toggleQuarterlyLock(qIdx) {
        const field = document.getElementById(`txtAnalysisQ${qIdx}`);
        const btn = document.getElementById(`btnLockQ${qIdx}`);
        if (!field || !btn) return;
        
        if (field.readOnly) {
            field.readOnly = false;
            field.style.background = 'white';
            field.focus();
            btn.innerHTML = 'อัปเดต';
            btn.className = 'text-[10px] px-2 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition';
        } else {
            // Save mode
            field.readOnly = true;
            field.style.background = 'rgba(255,255,255,0.4)';
            btn.innerHTML = 'ปลดล็อก';
            btn.className = 'text-[10px] px-2 py-1 rounded bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition';
            
            const kpi = appData[currentKpiIndex];
            if (!Array.isArray(kpi.analysis)) kpi.analysis = ['', '', '', ''];
            kpi.analysis[qIdx] = field.value;
            
            window.parent.postMessage({
                type: 'SAVE_DATA',
                action: 'UPDATE_QUARTERLY',
                payload: kpi,
                qIdx: qIdx
            }, '*');
            
            showToast('อัปเดตข้อมูลไตรมาส ' + (qIdx+1) + ' สำเร็จ', 'success');
        }
    }
    """
    html = re.sub(r'function handleAnalysisInput\(qIdx\) \{.*?\}', new_handleAnalysisInput, html, flags=re.DOTALL)

    # In `buildQuarterlySummary`, replace textarea with readonly and add lock button
    textarea_regex = r'<textarea id="txtAnalysisQ\$\{qIdx\}".*?</textarea>'
    new_textarea = """
    <textarea id="txtAnalysisQ${qIdx}" oninput="handleAnalysisInput(${qIdx})" readonly
              class="flex-1 p-1.5 rounded text-xs resize-none overflow-hidden outline-none transition"
              style="min-height:44px; height:44px; background:rgba(255,255,255,0.4); border:1px solid ${isPending ? '#fbbf24' : '#e2e8f0'};"
              placeholder="${isPending ? 'รอดำเนินการ — ยังไม่ถึงไตรมาสนี้' : 'วิเคราะห์/แนวทางพัฒนา '+q.name}">${isPending && !analysisVal ? 'รอดำเนินการ' : analysisVal}</textarea>
    <button id="btnLockQ${qIdx}" onclick="toggleQuarterlyLock(${qIdx})" class="text-[10px] px-2 py-1 rounded bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition shrink-0 mt-1">ปลดล็อก</button>
    """
    html = re.sub(textarea_regex, new_textarea.strip(), html, flags=re.DOTALL)

    # 6. Remove saveData function as we don't use localStorage
    html = re.sub(r'function saveData\(\) \{.*?\}', '', html, flags=re.DOTALL)

    # Write modified html
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("Dashboard modifications applied.")

if __name__ == '__main__':
    main()
