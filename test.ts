import * as ExcelJS from 'exceljs';
interface AcceptedSubmission{
    handle: string;
    problem: string;
    delivered: string;
}
(async function readSubmissionsFromExcel(filePath: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const sheet = workbook.worksheets[0]; // Assuming submissions are in the first sheet
    console.log(workbook.worksheets[0].name)
    //const submissions: Submission[] = [];
    //console.log(sheet)
    console.log(sheet.actualRowCount + " " + sheet.actualColumnCount)
    let existingSubmissions : AcceptedSubmission[] = [];
    sheet.eachRow((row, rowNum) => {
        if(rowNum !== 1){
            const submission: AcceptedSubmission = {
                handle: row.getCell(1).value?.toString() || '', 
                problem: row.getCell(2).value?.toString() || '', 
                delivered: row.getCell(3).value?.toString() || '' 
            };
            if(submission.handle != '' && submission.problem != '' && submission.delivered != '')
                existingSubmissions.push(submission);
            //console.log(row.values)
            console.log(submission)
        }
    });
    //console.log(existingSubmissions)

})("accepted.xlsx")