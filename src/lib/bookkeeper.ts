// @ts-nocheck
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from '@/assets/fonts/vfs_fonts';
import { appName as defaultAppName, appOwner as defaultAppOwner } from './env';

if (pdfMake && pdfFonts) {
  pdfMake.vfs = pdfFonts;
}

/**
 * Core Bookkeeper calculation algorithm (WK Sampath, 2020-2023)
 * DO NOT ALTER THE FORMULAS - STRICT MATHEMATICAL COMPATIBILITY REQUIRED
 */
export function calculate(data: any[] = [], dues: number | string = 0, bank_balance: number | string = 0, bank_admin_balance: number | string = 0) {
  let tol_noncasset = 0; /* Total Non-Current Assets */
  let tol_cliabilities = 0; /* Total Current Liabilities > Payables */
  let tol_bbf = 0; /* Balance Brought Forward - Cash */
  let tol_bbf_bank = 0; /* Balance Brought Forward - Bank */
  let tol_bbf_admin_bank = 0; /* Balance Brought Forward - Bank Admin */
  let tol_receipts = parseFloat(String(dues)) || 0; /* Total Receipts */
  let tol_payments = 0; /* Total Payments */
  let tol_income = parseFloat(String(dues)) || 0; /* Total Income */
  let tol_expenses = 0; /* Total Expenses */
  let tol_receivables = 0; /* Total Receivables */
  let accumulated_start = 0; /* Accumulated Fund (Capital) At Start */
  const arr_pronames: string[] = [];
  const arr_id: number[] = [];
  const incomes: any[] = [];
  const expenses: any[] = [];
  const receipts: any[] = [];
  const payments: any[] = [];
  const receivables: any[] = [];
  const payables: any[] = [];
  const non_current: any[] = [];
  const bbfPayables: any[] = [];
  const bbfReceivables: any[] = [];
  const bbfNonCAssets: any[] = [];
  const count = data ? Object.keys(data).length : 0;

  for (let i = 0; i < count; i++) {
    const item = data[i];
    if (!item) continue;

    switch (item.type) {
      case 'cr': /* Income - Cash Received */
        incomes.push({
          id: item.id,
          description: item.detail,
          value: item.value,
          method: item.mode,
          type: item.type,
        });

        receipts.push({
          id: item.id,
          description: item.detail,
          value: item.value,
          method: item.mode,
          type: item.type,
        });

        tol_income += parseFloat(item.value) || 0;
        tol_receipts += parseFloat(item.value) || 0;
        break;

      case 'cnr': /* Income - Cash Not Received */ {
        const to_receive_amount = (parseFloat(item.value) || 0) - (parseFloat(item.settled_value) || 0);

        if (item.is_bbf == 0) {
          incomes.push({
            id: item.id,
            description: item.detail,
            value: item.value,
            method: item.mode,
            type: item.type,
            meta: '(Initial type: Receivable)',
          });

          tol_income += parseFloat(item.value) || 0;
        } else {
          bbfReceivables.push({
            id: item.id,
            detail: item.detail,
            value: item.value,
            settled_value: item.settled_value,
            mode: item.mode,
            type: item.type,
            meta: '(Initial type: Receivable)',
          });
        }

        if (to_receive_amount > 0) {
          const bbf = item.is_bbf == 0 ? '' : ' [BBF]';
          receivables.push({
            id: item.id,
            description: item.detail + bbf,
            value: to_receive_amount,
          });
        }

        if (parseFloat(item.settled_value) > 0) {
          receipts.push({
            id: item.id,
            description: item.detail,
            value: item.settled_value,
            method: '-',
            type: item.type,
            meta: '(Receivable Receival)',
          });
        }

        tol_receipts += parseFloat(item.settled_value) || 0;
        tol_receivables += to_receive_amount;
        break;
      }

      case 'loan': /* Income - Loan */ {
        const to_pay_amount = (parseFloat(item.value) || 0) - (parseFloat(item.settled_value) || 0);

        if (item.is_bbf == 0) {
          receipts.push({
            id: item.id,
            description: item.detail,
            value: item.value,
            method: item.mode,
            type: item.type,
            meta: '(Loan)',
          });

          tol_receipts += parseFloat(item.value) || 0;
        } else {
          bbfPayables.push({
            id: item.id,
            detail: item.detail,
            value: item.value,
            settled_value: item.settled_value,
            mode: item.mode,
            type: item.type,
            meta: '(Initial type: Loan)',
          });
        }

        if (parseFloat(item.settled_value) > 0) {
          payments.push({
            id: item.id,
            description: item.detail,
            value: item.settled_value,
            method: '-',
            type: item.type,
            meta: '(Loan Payment)',
          });
        }

        if (to_pay_amount > 0) {
          const bbf_p = item.is_bbf == 0 ? '' : ' [BBF]';
          payables.push({
            id: item.id,
            description: item.detail + bbf_p,
            value: to_pay_amount,
          });
        }

        tol_payments += parseFloat(item.settled_value) || 0;
        tol_cliabilities += to_pay_amount;
        break;
      }

      case 'ex': /* Expense */
        expenses.push({
          id: item.id,
          description: item.detail,
          value: item.value,
          type: item.type,
        });

        payments.push({
          id: item.id,
          description: item.detail,
          value: item.value,
          method: item.mode,
          type: item.type,
        });

        tol_expenses += parseFloat(item.value) || 0;
        tol_payments += parseFloat(item.value) || 0;
        break;

      case 'accum': /* Accumulated Fund */
        accumulated_start = parseFloat(item.value) || 0;
        break;

      case 'pro': /* Projects */
        arr_pronames.push(item.proname);
        arr_id.push(i);
        break;

      case 'noncrnt': /* Non-Current Assets */
        non_current.push({
          id: item.id,
          description: item.detail,
          value: item.value,
          type: item.type,
        });

        if (item.is_bbf == 0) {
          incomes.push({
            id: item.id,
            description: item.detail,
            value: item.value,
            type: item.type,
          });

          tol_income += parseFloat(item.value) || 0;
        } else {
          bbfNonCAssets.push({
            id: item.id,
            detail: item.detail,
            value: item.value,
            settled_value: item.settled_value,
            mode: item.mode,
            type: item.type,
            meta: '(Non-Current Asset)',
          });
        }

        tol_noncasset += parseFloat(item.value) || 0;
        break;

      case 'bbf': /* Balance Brought Forward */
        if (item.mode == 'C') {
          tol_bbf = parseFloat(item.value) || 0;
        } else if (item.mode == 'A') {
          tol_bbf_admin_bank = parseFloat(item.value) || 0;
        } else {
          tol_bbf_bank = parseFloat(item.value) || 0;
        }

        tol_receipts += parseFloat(item.value) || 0;
        break;
    }
  }

  // Calculating project budgets
  const uniqueItems = Array.from(new Set(arr_pronames));
  const arr_len = arr_id.length;
  const multi_arr: any[] = [];

  for (let y = 0; y < uniqueItems.length; y++) {
    multi_arr.push([uniqueItems[y], 0, 0, 0, 0]);
  }

  let index = 0;
  for (let x = 0; x < arr_len; x++) {
    const row = data[arr_id[x]];
    switch (row.payment_type) {
      case 'cr': index = 1; break;
      case 'cnr': index = 2; break;
      case 'loan': index = 3; break;
      case 'ex': index = 4; break;
    }

    for (let i = 0; i < uniqueItems.length; i++) {
      if (multi_arr[i][0] == row.proname) {
        if (index == 1 || index == 4) {
          multi_arr[i][index] = (parseFloat(multi_arr[i][index]) || 0) + (parseFloat(row.value) || 0);
        } else if (index == 2) {
          const to_receive_val = (parseFloat(row.value) || 0) - (parseFloat(row.settled_value) || 0);
          multi_arr[i][2] = (parseFloat(multi_arr[i][index]) || 0) + to_receive_val;
          multi_arr[i][1] = (parseFloat(multi_arr[i][1]) || 0) + (parseFloat(row.settled_value) || 0);

          if (to_receive_val > 0) {
            receivables.push({
              id: row.id,
              description: `${row.detail} ( ${row.proname} )`,
              value: to_receive_val,
            });
          }
        } else {
          const to_pay_val = (parseFloat(row.value) || 0) - (parseFloat(row.settled_value) || 0);
          multi_arr[i][3] = (parseFloat(multi_arr[i][index]) || 0) + to_pay_val;

          if (to_pay_val > 0) {
            payables.push({
              id: row.id,
              description: `${row.detail} ( ${row.proname} )`,
              value: to_pay_val,
            });
          }
        }
      }
    }
  }

  for (let i = 0; i < uniqueItems.length; i++) {
    if (multi_arr[i][1] > 0) {
      incomes.push({
        id: multi_arr[i][0],
        description: multi_arr[i][0],
        value: multi_arr[i][1],
        method: '-',
        type: 'pro',
      });
      receipts.push({
        id: multi_arr[i][0],
        description: multi_arr[i][0],
        value: multi_arr[i][1],
        method: '-',
        type: 'pro',
      });
      tol_income += parseFloat(multi_arr[i][1]);
      tol_receipts += parseFloat(multi_arr[i][1]);
    }
    if (multi_arr[i][2] > 0) {
      incomes.push({
        id: multi_arr[i][0],
        description: multi_arr[i][0],
        value: multi_arr[i][2],
        method: '-',
        type: 'pro',
        meta: '(Initial type: Receivable)',
      });
      tol_income += parseFloat(multi_arr[i][2]);
      tol_receivables += parseFloat(multi_arr[i][2]);
    }
    if (multi_arr[i][3] > 0) {
      receipts.push({
        id: multi_arr[i][0],
        description: `${multi_arr[i][0]} [Loan]`,
        value: multi_arr[i][3],
        method: '-',
        type: 'pro',
        meta: '(Loan)',
      });
      tol_receipts += parseFloat(multi_arr[i][3]);
      tol_cliabilities += parseFloat(multi_arr[i][3]);
    }
    if (multi_arr[i][4] > 0) {
      expenses.push({
        id: multi_arr[i][0],
        description: multi_arr[i][0],
        value: multi_arr[i][4],
        type: 'pro',
      });
      payments.push({
        id: multi_arr[i][0],
        description: multi_arr[i][0],
        value: multi_arr[i][4],
        method: '-',
        type: 'pro',
      });
      tol_expenses += parseFloat(multi_arr[i][4]);
      tol_payments += parseFloat(multi_arr[i][4]);
    }
  }

  const balance = tol_receipts - tol_payments;
  const surplus = tol_income - tol_expenses;
  const bankBal = parseFloat(String(bank_balance)) || 0;
  const bankAdminBal = parseFloat(String(bank_admin_balance)) || 0;
  const cash_in_hand = tol_receipts - tol_payments - bankBal - bankAdminBal;
  const total_current_assets = tol_receivables + tol_receipts - tol_payments;
  const total_assets = tol_noncasset + tol_receivables + tol_receipts - tol_payments;
  const accumulated_end = accumulated_start + tol_income - tol_expenses;
  const total_liabilities = accumulated_start + tol_income - tol_expenses + tol_cliabilities;

  const pro_tables: any[] = [];
  for (let k = 0; k < uniqueItems.length; k++) {
    const income: any[] = [];
    const expense: any[] = [];
    let tolincome = 0;
    let tolexpense = 0;
    let proid = 0;

    for (let l = 0; l < arr_id.length; l++) {
      const idx = arr_id[l];
      if (data[idx].proname == uniqueItems[k]) {
        proid = data[idx].proid;
        switch (data[idx].payment_type) {
          case 'cr':
            income.push({
              id: data[idx].id,
              description: data[idx].detail,
              value: data[idx].value,
              type: 'CR',
            });
            tolincome += parseFloat(data[idx].value) || 0;
            break;
          case 'cnr': {
            const settled_str = (parseFloat(data[idx].settled_value) || 0).toLocaleString('en', { minimumFractionDigits: 2 });
            income.push({
              id: data[idx].id,
              description: data[idx].detail,
              value: data[idx].value,
              type: 'RCBLE',
              meta: `(Received: ${settled_str} LKR)`,
            });
            tolincome += parseFloat(data[idx].value) || 0;
            break;
          }
          case 'loan': {
            const paid_str = (parseFloat(data[idx].settled_value) || 0).toLocaleString('en', { minimumFractionDigits: 2 });
            income.push({
              id: data[idx].id,
              description: data[idx].detail,
              value: data[idx].value,
              type: 'LOAN',
              meta: `(Paid: ${paid_str} LKR)`,
            });
            tolincome += parseFloat(data[idx].value) || 0;
            break;
          }
          case 'ex':
            expense.push({
              id: data[idx].id,
              description: data[idx].detail,
              value: data[idx].value,
              type: 'EXPN',
            });
            tolexpense += parseFloat(data[idx].value) || 0;
            break;
        }
      }
    }

    pro_tables.push({
      id: proid,
      proname: uniqueItems[k],
      incomes: income,
      tol_income: tolincome,
      expenses: expense,
      tol_expense: tolexpense,
    });
  }

  // Exact 29-element array return for backwards compatibility
  return [
    non_current,              // 0
    tol_noncasset,            // 1
    tol_receivables,          // 2
    cash_in_hand,             // 3
    total_current_assets,     // 4
    total_assets,             // 5
    accumulated_start,        // 6
    surplus,                  // 7
    accumulated_end,          // 8
    tol_cliabilities,         // 9
    total_liabilities,        // 10
    incomes,                  // 11
    expenses,                 // 12
    tol_expenses,             // 13
    tol_income,               // 14
    tol_bbf,                  // 15
    tol_bbf_bank,             // 16
    tol_bbf_admin_bank,       // 17
    balance,                  // 18
    tol_payments,             // 19
    tol_receipts,             // 20
    payments,                 // 21
    receipts,                 // 22
    receivables,              // 23
    payables,                 // 24
    pro_tables,               // 25
    bbfReceivables,           // 26
    bbfPayables,              // 27
    bbfNonCAssets,            // 28
  ];
}

/**
 * Convenient object-returning wrapper for React hooks and components
 */
export function calculateAccounting(data: any[] = [], dues = 0, bank_balance = 0, bank_admin_balance = 0) {
  const arr = calculate(data, dues, bank_balance, bank_admin_balance);
  const isAccurate = Math.abs(parseFloat(String(arr[5])) - parseFloat(String(arr[10]))) < 0.01;

  return {
    rawArray: arr,
    nonCurrentAssets: arr[0],
    totalNonCurrentAssets: arr[1],
    totalReceivables: arr[2],
    cashInHand: arr[3],
    totalCurrentAssets: arr[4],
    totalAssets: arr[5],
    accumulatedStart: arr[6],
    surplus: arr[7],
    accumulatedEnd: arr[8],
    totalCurrentLiabilities: arr[9],
    totalLiabilities: arr[10],
    incomesList: arr[11],
    expensesList: arr[12],
    totalExpenses: arr[13],
    totalIncome: arr[14],
    bbfCash: arr[15],
    bbfBank: arr[16],
    bbfAdminBank: arr[17],
    balance: arr[18],
    totalPayments: arr[19],
    totalReceipts: arr[20],
    paymentsList: arr[21],
    receiptsList: arr[22],
    receivablesList: arr[23],
    payablesList: arr[24],
    projectBudgets: arr[25],
    bbfReceivables: arr[26],
    bbfPayables: arr[27],
    bbfNonCAssets: arr[28],
    isAccurate,
  };
}

/**
 * PDF Generator preserving exact table structures and styling
 */
export function exportBookkeepingAsPDF(
  data: any[],
  dues: number | string,
  bank_bal: number | string,
  bank_admin_bal: number | string,
  ownerName: string,
  appName = defaultAppName,
  appOwner = defaultAppOwner
) {
  const result = calculateAccounting(data, dues, bank_bal, bank_admin_bal);

  const fmt = (n: number | string) =>
    (parseFloat(String(n)) || 0).toLocaleString('en', { minimumFractionDigits: 2 });

  const dues_f = fmt(dues);
  const bank_bal_f = fmt(bank_bal);
  const bank_admin_bal_f = fmt(bank_admin_bal);

  // Income & Expense Table
  const inexin_pdf: any[] = [
    [
      'Description',
      { text: 'Record ID', fillColor: '#fff7d4' },
      { text: 'Value (LKR)', alignment: 'right', fillColor: '#fff7d4' },
    ],
    [{ text: 'Income:', colSpan: 3 }, {}, {}],
    ['Club Membership Dues: Collected', 'N/A', { text: dues_f, alignment: 'right' }],
  ];
  for (const el of result.incomesList) {
    inexin_pdf.push([el.description, el.type === 'pro' ? 'N/A' : el.id, { text: fmt(el.value), alignment: 'right' }]);
  }

  const inexex_pdf: any[] = [[{ text: 'Expense:', colSpan: 3 }, {}, {}]];
  for (const el of result.expensesList) {
    inexex_pdf.push([el.description, el.type === 'pro' ? 'N/A' : el.id, { text: fmt(el.value), alignment: 'right' }]);
  }

  function table1() {
    let t = [...inexin_pdf];
    t.push([
      { text: 'Total Income', colSpan: 2, style: 'header' },
      '',
      { text: fmt(result.totalIncome), style: 'header', alignment: 'right', fillColor: '#fff7d4' },
    ]);
    t.push([{ text: ' ', colSpan: 3 }, {}, {}]);
    t = t.concat(inexex_pdf);
    t.push([
      { text: 'Total Expenses', colSpan: 2, style: 'header' },
      '',
      { text: fmt(result.totalExpenses), style: 'header', alignment: 'right', fillColor: '#fff7d4' },
    ]);
    t.push([
      { text: 'Surplus/ Deficit For The Period', colSpan: 2, style: 'header' },
      '',
      { text: fmt(result.surplus), style: 'header', alignment: 'right', fillColor: '#feca8a' },
    ]);
    return t;
  }

  // Receipts & Payments Table
  const rpr_pdf: any[] = [
    [{ text: 'Receipts:', colSpan: 4 }, {}, {}, {}],
    ['Club Membership Dues: Collected ', 'N/A', '-', { text: dues_f, alignment: 'right' }],
  ];
  for (const el of result.receiptsList) {
    rpr_pdf.push([el.description, el.type === 'pro' ? 'N/A' : el.id, el.method || '-', { text: fmt(el.value), alignment: 'right' }]);
  }

  const rpp_pdf: any[] = [[{ text: 'Payments:', colSpan: 4 }, {}, {}, {}]];
  for (const el of result.paymentsList) {
    rpp_pdf.push([el.description, el.type === 'pro' ? 'N/A' : el.id, el.method || '-', { text: fmt(el.value), alignment: 'right' }]);
  }

  function table2() {
    let temp = [
      [
        'Description',
        { text: 'Record ID', fillColor: '#fff7d4' },
        { text: 'M', fillColor: '#fff7d4' },
        { text: 'Value (LKR)', alignment: 'right', fillColor: '#fff7d4' },
      ],
      [{ text: 'Balance Brought Forward (Cash)', colSpan: 3 }, {}, {}, { text: fmt(result.bbfCash), style: 'header', alignment: 'right' }],
      [{ text: 'Balance Brought Forward (Bank - Service)', colSpan: 3 }, {}, {}, { text: fmt(result.bbfBank), style: 'header', alignment: 'right' }],
      [{ text: 'Balance Brought Forward (Bank - Admin)', colSpan: 3 }, {}, {}, { text: fmt(result.bbfAdminBank), style: 'header', alignment: 'right' }],
      [{ text: ' ', colSpan: 4 }, {}, {}, {}],
    ];
    temp = temp.concat(rpr_pdf);
    temp.push([
      { text: 'Total Receipts ', style: 'header', colSpan: 3 },
      {},
      {},
      { text: fmt(result.totalReceipts), style: 'header', alignment: 'right', fillColor: '#fff7d4' },
    ]);
    temp.push([{ text: ' ', colSpan: 4 }, {}, {}, {}]);
    temp = temp.concat(rpp_pdf);
    temp.push([
      { text: 'Total Payments ', style: 'header', colSpan: 3 },
      {},
      {},
      { text: fmt(result.totalPayments), style: 'header', alignment: 'right', fillColor: '#fff7d4' },
    ]);
    temp.push([
      { text: 'Balance At The End of The Period ', style: 'header', colSpan: 3 },
      {},
      {},
      { text: fmt(result.balance), fillColor: '#feca8a', style: 'header', alignment: 'right' },
    ]);
    return temp;
  }

  // Receivables table
  function table3() {
    const list: any[] = [
      ['Description', { text: 'Record ID', fillColor: '#fff7d4' }, { text: 'Value (LKR)', alignment: 'right', fillColor: '#fff7d4' }],
    ];
    for (const el of result.receivablesList) {
      list.push([el.description, el.id, { text: fmt(el.value), alignment: 'right' }]);
    }
    list.push([
      { text: 'Total Receivables', style: 'header', colSpan: 2 },
      {},
      { text: fmt(result.totalReceivables), fillColor: '#feca8a', style: 'header', alignment: 'right' },
    ]);
    return list;
  }

  // Payables table
  function table4() {
    const list: any[] = [
      ['Description', { text: 'Record ID', fillColor: '#fff7d4' }, { text: 'Value (LKR)', alignment: 'right', fillColor: '#fff7d4' }],
    ];
    for (const el of result.payablesList) {
      list.push([el.description, el.id, { text: fmt(el.value), alignment: 'right' }]);
    }
    list.push([
      { text: 'Total Payables', style: 'header', colSpan: 2 },
      {},
      { text: fmt(result.totalCurrentLiabilities), fillColor: '#feca8a', style: 'header', alignment: 'right' },
    ]);
    return list;
  }

  // Balance sheet table
  function table5() {
    const bal: any[] = [
      ['', { text: 'Record ID', fillColor: '#fff7d4' }, { text: 'Value (LKR)', alignment: 'right', fillColor: '#fff7d4' }],
      [{ text: 'Non-Current Assets:', colSpan: 3 }, {}, {}],
    ];
    for (const el of result.nonCurrentAssets) {
      bal.push([el.description, el.id, { text: fmt(el.value), alignment: 'right' }]);
    }
    bal.push([
      { text: 'Total Non-Current Assets', style: 'header', colSpan: 2 },
      {},
      { text: fmt(result.totalNonCurrentAssets), style: 'header', alignment: 'right', fillColor: '#fff7d4' },
    ]);
    bal.push([{ text: ' ', colSpan: 3 }, {}, {}]);
    bal.push([{ text: 'Current Assets:', colSpan: 3 }, {}, {}]);
    bal.push([{ text: 'Receivables', colSpan: 2 }, {}, { text: fmt(result.totalReceivables), alignment: 'right' }]);
    bal.push([{ text: 'Cash In Hand', colSpan: 2 }, {}, { text: fmt(result.cashInHand), alignment: 'right' }]);
    bal.push([{ text: 'Bank Account Balance (Service)', colSpan: 2 }, {}, { text: bank_bal_f, alignment: 'right' }]);
    bal.push([{ text: 'Bank Account Balance (Admin)', colSpan: 2 }, {}, { text: bank_admin_bal_f, alignment: 'right' }]);
    bal.push([
      { text: 'Total Current Assets', style: 'header', colSpan: 2 },
      {},
      { text: fmt(result.totalCurrentAssets), fillColor: '#fff7d4', style: 'header', alignment: 'right' },
    ]);
    bal.push([
      { text: 'Total Assets', style: 'header', colSpan: 2 },
      {},
      { text: fmt(result.totalAssets), fillColor: '#feca8a', style: 'header', alignment: 'right' },
    ]);
    bal.push([{ text: ' ', colSpan: 3 }, {}, {}]);
    bal.push([
      { text: 'Accumulated Fund (Capital) At Start', style: 'header', colSpan: 2 },
      {},
      { text: fmt(result.accumulatedStart), fillColor: '#fff7d4', style: 'header', alignment: 'right' },
    ]);
    bal.push([{ text: 'Surplus / Deficit for the period', colSpan: 2 }, {}, { text: fmt(result.surplus), alignment: 'right' }]);
    bal.push([
      { text: 'Accumulated Fund (Capital) At End', style: 'header', colSpan: 2 },
      {},
      { text: fmt(result.accumulatedEnd), fillColor: '#fff7d4', style: 'header', alignment: 'right' },
    ]);
    bal.push([{ text: ' ', colSpan: 3 }, {}, {}]);
    bal.push([
      { text: 'Total Current Liabilities', style: 'header', colSpan: 2 },
      {},
      { text: fmt(result.totalCurrentLiabilities), fillColor: '#fff7d4', style: 'header', alignment: 'right' },
    ]);
    bal.push([
      { text: 'Total Liabilities & Equity', style: 'header', colSpan: 2 },
      {},
      { text: fmt(result.totalLiabilities), fillColor: '#feca8a', style: 'header', alignment: 'right' },
    ]);
    return bal;
  }

  const pro_tables: any[] = [];
  for (const project of result.projectBudgets) {
    pro_tables.push({ text: `${project.proname}:` });
    const tableHeader = [
      [
        'Description',
        { text: 'Record ID', fillColor: '#fff7d4' },
        { text: 'Type', fillColor: '#fff7d4' },
        { text: 'Value (LKR)', alignment: 'right', fillColor: '#fff7d4' },
      ],
    ];

    const inc: any[] = [[{ text: 'Income:', colSpan: 4, color: 'gray' }, {}, {}, {}]];
    for (const income of project.incomes) {
      inc.push([income.description, income.id, income.type, { text: fmt(income.value), alignment: 'right' }]);
    }

    const exp: any[] = [[{ text: 'Expense:', colSpan: 4, color: 'gray' }, {}, {}, {}]];
    for (const expense of project.expenses) {
      exp.push([expense.description, expense.id, expense.type, { text: fmt(expense.value), alignment: 'right' }]);
    }

    let tbl = tableHeader.concat(inc);
    tbl.push([
      { text: 'Total Income', colSpan: 3, style: 'header' },
      '',
      '',
      { text: fmt(project.tol_income), style: 'header', alignment: 'right', fillColor: '#fff7d4' },
    ]);
    tbl = tbl.concat(exp);
    tbl.push([
      { text: 'Total Expense', colSpan: 3, style: 'header' },
      '',
      '',
      { text: fmt(project.tol_expense), style: 'header', alignment: 'right', fillColor: '#fff7d4' },
    ]);

    pro_tables.push({ style: 'table', table: { widths: [250, '*', '*', '*'], body: tbl } }, ' ');
  }

  const d = new Date();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dateStr = `${d.getFullYear()}/${m < 10 ? '0' : ''}${m}/${day < 10 ? '0' : ''}${day}`;

  const docDefinition: any = {
    defaultStyle: { font: 'myfont' },
    pageSize: 'A4',
    pageMargins: [60, 45, 60, 70],
    watermark: { text: appName, color: 'gray', opacity: 0.1, bold: false, italics: false },
    content: [
      { text: 'FINANCIAL REPORT', fontSize: 18, bold: true, color: '#5b9bd5' },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 555 - 2 * 40, y2: 5, lineWidth: 1, color: '#5b9bd5' }] },
      ' ',
      { text: ownerName, fontSize: 14 },
      { text: `Report is generated on ${dateStr}`, fontSize: 11 },
      ' ',
      ' ',
      'Income and Expenditure Statement',
      ' ',
      { style: 'table', table: { widths: [300, '*', '*'], body: table1() } },
      { text: 'Receipts and Payments Statement', pageBreak: 'before' },
      ' ',
      { style: 'table', table: { widths: [280, '*', 10, '*'], body: table2() } },
      ' ',
      { text: 'C: Cash Transaction B: Bank Transaction (Service) A: Bank Transaction (Admin)', fontSize: 8 },
      { text: 'Receivables', pageBreak: 'before' },
      ' ',
      { style: 'table', table: { widths: [300, '*', '*'], body: table3() } },
      ' ',
      'Creditors/Payables',
      ' ',
      { style: 'table', table: { widths: [300, '*', '*'], body: table4() } },
      { text: 'Balance Sheet', pageBreak: 'before' },
      ' ',
      { style: 'table', table: { widths: [300, '*', '*'], body: table5() } },
      { text: 'Project Budgets', pageBreak: 'before' },
      ' ',
      { text: '[RCBLE: RECEIVABLE, LOAN: LOAN, CR: CASH RECEIVED, EXPN: EXPENSE]', alignment: 'left', fontSize: 8, color: '#65676b' },
      ' ',
      pro_tables,
      ' ',
      { text: ' ', pageBreak: 'before' },
      ' ',
      { text: appName, alignment: 'center' },
      { text: `© ${appOwner}`, alignment: 'center' },
    ],
    styles: {
      header: { bold: true, italics: true, color: '#1877f2' },
      table: { fontSize: 10 },
      headerfill: { bold: true, italics: true, color: '#FFFFFF', fillColor: '#2361AE' },
    },
  };

  pdfMake.fonts = {
    myfont: {
      normal: 'nirmala.ttf',
      bold: 'nirmala.ttf',
      italics: 'nirmala.ttf',
      bolditalics: 'nirmala.ttf',
    },
  };

  pdfMake.createPdf(docDefinition).download('wallet.pdf');
}

