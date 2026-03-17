function updateProductionData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // ================= 1. CONFIGURATION (De-identified) =================
  const SHEET_NAMES = {
    TARGET: "Main_Database",        // 目标汇总表
    DATA_A: "Metric_Category_A",    // 质量/产量统计
    DATA_B: "Metric_Category_B",    // 运行天数/时间
    DATA_C: "Metric_Category_C",    // 能源/效率评分
    MAPPING: "Entity_Mapping"       // 资产/机台对应关系表
  };
  
  const sheetTarget = ss.getSheetByName(SHEET_NAMES.TARGET);
  const sheetMetricA = ss.getSheetByName(SHEET_NAMES.DATA_A);
  const sheetMetricB = ss.getSheetByName(SHEET_NAMES.DATA_B);
  const sheetMetricC = ss.getSheetByName(SHEET_NAMES.DATA_C);
  const sheetMap = ss.getSheetByName(SHEET_NAMES.MAPPING);

  // Helper: Extract numeric ID from strings (e.g., "Device-10" -> "10")
  const extractId = (val) => {
    if (!val) return "";
    const match = String(val).match(/\d+/);
    return match ? match[0] : String(val).trim();
  };

  // Generic Entity List (De-identified)
  const rawEntities = "ID01,ID02,ID03,ID04,ID05,ID06,ID10,ID11".split(/[,，]/);
  const ALL_ENTITIES = [...new Set(rawEntities.map(m => extractId(m)).filter(m => m))];

  // ================= 2. TIME & FISCAL RULES =================
  const today = new Date();
  const timeZone = ss.getSpreadsheetTimeZone();
  
  // Current Running Month (For Col A identification)
  const runDateStr = Utilities.formatDate(today, timeZone, "yyyy-MM");

  // Fiscal Month Logic (Cut-off day: 15th)
  // Used to fetch historical data from source sheets
  let targetYear = today.getFullYear();
  let targetMonth = today.getMonth(); 
  if (today.getDate() < 15) { targetMonth = targetMonth - 1; }
  const planDateObj = new Date(targetYear, targetMonth, 15);
  const planDateStr = Utilities.formatDate(planDateObj, timeZone, "yyyy/MM/dd");
  const targetMonthLabel = Utilities.formatDate(planDateObj, timeZone, "yyyy-MM");

  // ================= 3. DATA PRE-LOADING =================
  
  // Load Mapping Data
  const mapCorrespondence = {};
  const dataMap = sheetMap.getDataRange().getValues();
  for (let i = 1; i < dataMap.length; i++) {
    const key = extractId(dataMap[i][0]);
    if (key) {
      mapCorrespondence[key] = {
        attr1: dataMap[i][1], attr2: dataMap[i][2], refA: dataMap[i][3] || "", refB: dataMap[i][4] || ""
      };
    }
  }

  // Load Metric C (Energy/Score)
  const mapMetricC = {};
  const dataC = sheetMetricC.getDataRange().getValues();
  for (let i = 1; i < dataC.length; i++) {
    const mMonth = formatDateSafe(dataC[i][0]);
    const mEntity = extractId(dataC[i][1]);
    if (mMonth === targetMonthLabel) {
      let rawVal = dataC[i][8]; 
      let parsedVal = (typeof rawVal === 'number') ? Number((rawVal * 100).toFixed(4)) : 
                       (typeof rawVal === 'string' && rawVal.includes('%')) ? Number(rawVal.replace('%', '')) : rawVal;
      mapMetricC[mEntity] = parsedVal;
    }
  }

  // Load Metric B (Run Days)
  const mapMetricB = {};
  const dataB = sheetMetricB.getDataRange().getValues();
  for (let i = 1; i < dataB.length; i++) {
    const mEntity = extractId(dataB[i][0]);
    const mMonth = formatDateSafe(dataB[i][1]);
    if (mMonth === targetMonthLabel) { mapMetricB[mEntity] = Number(dataB[i][2]) || 0; }
  }

  // Load Metric A (Quality/Quantity)
  const mapMetricA = {};
  const dataA = sheetMetricA.getDataRange().getValues();
  for (let i = 1; i < dataA.length; i++) {
    const mMonth = formatDateSafe(dataA[i][1]);
    if (mMonth === targetMonthLabel) {
      const mEntity = extractId(dataA[i][0]);
      mapMetricA[mEntity] = Number(dataA[i][2]) || 0;
    }
  }
  
  // Scan Target Sheet for existing records in the current running month
  const dataTarget = sheetTarget.getDataRange().getValues();
  const mapExistingRow = {}; 
  const mapHistory = {}; 
  for (let i = 1; i < dataTarget.length; i++) {
    const tRecordMonth = formatDateSafe(dataTarget[i][0]); // Check Col A
    const tEntity = extractId(dataTarget[i][1]);          // Check Col B (ID)
    
    if (tRecordMonth === runDateStr) {
      mapExistingRow[tEntity] = i + 1; // Mark row for update
    } else {
      // Store historical data for cumulative logic
      mapHistory[tEntity] = { 
        valA: Number(dataTarget[i][5])||0, 
        valB: Number(dataTarget[i][6])||0, 
        status: Number(dataTarget[i][13])||0 
      };
    }
  }

  // ================= 4. PROCESSING & WRITING =================
  const rowsToAdd = [];

  for (let i = 0; i < ALL_ENTITIES.length; i++) {
    const entityId = ALL_ENTITIES[i];
    const currentA = mapMetricA[entityId] || 0;
    const currentB = mapMetricB[entityId] || 0;
    const info = mapCorrespondence[entityId] || { attr1: "", attr2: "", refA: "", refB: "" };
    const valC = mapMetricC[entityId] !== undefined ? mapMetricC[entityId] : "";

    let finalA = currentA;
    let finalB = currentB;
    const hist = mapHistory[entityId];
    
    // Cumulative logic if certain status condition is met (e.g., status is 0)
    if (hist && hist.status === 0) {
      finalA += hist.valA;
      finalB += hist.valB;
    }

    if (mapExistingRow[entityId]) {
      // 🔄 Update existing record (Skip Col E / Index 4)
      const rIdx = mapExistingRow[entityId];
      sheetTarget.getRange(rIdx, 1, 1, 4).setValues([[ runDateStr, entityId, info.attr1, info.attr2 ]]);
      sheetTarget.getRange(rIdx, 6, 1, 8).setValues([[ finalA, finalB, info.refA, "", planDateStr, info.refB, valC, "" ]]);
    } else {
      // ✨ Append new row
      const newRow = new Array(15).fill("");
      newRow[0] = runDateStr; 
      newRow[1] = entityId; 
      newRow[2] = info.attr1; 
      newRow[3] = info.attr2; 
      newRow[4] = ""; // Col E initially empty
      newRow[5] = finalA; 
      newRow[6] = finalB; 
      newRow[7] = info.refA; 
      newRow[9] = planDateStr; 
      newRow[10] = info.refB; 
      newRow[11] = valC; 
      rowsToAdd.push(newRow);
    }
  }

  // Batch append new records
  if (rowsToAdd.length > 0) {
    sheetTarget.getRange(sheetTarget.getLastRow() + 1, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
  }
  
  SpreadsheetApp.getUi().alert("🚀 Sync Successful!\nRecords updated/appended for month: " + runDateStr);
}

/**
 * Utility: Safe Date Formatting
 */
function formatDateSafe(d) {
  if (!d) return "";
  try { 
    return Utilities.formatDate(new Date(d), Session.getScriptTimeZone(), "yyyy-MM"); 
  } catch (e) { 
    return String(d).substring(0, 7); 
  }
}
