import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { Submission } from '@acmascis/codeforces-client/build/interfaces/submission.interface';
import { AcceptedSubmission } from '../../interfaces/accepted_submission.interface';

let contestants = [{
    handle: "",
    bench: "",
    position: ""
}]

let colors = new Map<string, string>([
    ["A", "000000"], // Black
    ["B", "0000FF"], // Blue
    ["C", "008000"], // Green
    ["D", "FFFF00"], // Yellow
    ["E", "FFA500"], // Orange
    ["F", "800080"], // Purple
    ["G", "FFC0CB"], // Pink
    ["H", "A52A2A"], // Brown
    ["I", "FF0000"], // Red
    ["J", "FFFFFF"], // White
    ["K", "808080"], // Gray
    ["L", "00FFFF"]  // Cyan
]);

async function addSubmissionsToExcel(acceptedSubmissions: AcceptedSubmission[], filePath: string) {
    const hallsWorkbook = new ExcelJS.Workbook();
    await hallsWorkbook.xlsx.readFile("/home/mohanadkhaled/acm/contest-lvl1/balloons/src/services/files_manager/ContestLvl1.xlsx")
        .then(() => {
            const worksheet = hallsWorkbook.worksheets[0] 
            worksheet.eachRow((row, rowNum) => {
                contestants.push({
                    handle: row.getCell(6).value?.toString() || '',
                    bench: row.getCell(4).value?.toString() || '',
                    position: row.getCell(5).value?.toString() || '',
                })
            });
        })
        .catch(err => {
            console.error('Error writing data to Excel file:', err);
        });
    //console.log(contestants)
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath)
    .then(() => {
        const worksheet = workbook.worksheets[0] 
        worksheet.getColumn(1).width = 30
        
        acceptedSubmissions.forEach(item => {
            //get handle from sheet [sa3eed ONLY or fahmy ONLY] 
            //only write in one hall either sa3eed or fahmy
            //id : [1:64] sa3eed
            //id : [65:123] fahmy
            //and then bench number (front to back) then position in bench (left to right)
            const contestant = contestants.find(contestant => contestant.handle === item.handle);
            console.log(contestant)
            if(contestant !== undefined){
                let bench = contestant.bench
                let position = contestant.position
               
                let addedRow = worksheet.addRow([item.handle, item.problem, "NO",bench,position]);
                addedRow.eachCell(cell => {
                    cell.font = {
                        color: { argb: colors.get(item.problem) }, 
                        bold: true, 
                        size: 12, 
                        name: 'Arial',
                        //outline:  colors.get(item.problem) === "000000" ? false : true
                    };
                    cell.numFmt = '20'; 
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                });

                if(colors.get(item.problem) !== "000000"){
                    addedRow.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                    };
                }
            }
        });
        workbook.xlsx.writeFile(filePath);
    })
    .then(() => {
        console.log('Data written to Excel file successfully.');
    })
    .catch(err => {
        console.error('Error writing data to Excel file:', err);
    });
}

async function readSubmissionsFromExcel(filePath: string): Promise<AcceptedSubmission[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const sheet = workbook.worksheets[0]; 
    
    let existingSubmissions : AcceptedSubmission[] = [];
    sheet.eachRow((row, rowNum) => {
        //read from 1st or 2nd ??
        const submission: AcceptedSubmission = {
            handle: row.getCell(1).value?.toString() || '', 
            problem: row.getCell(2).value?.toString() || '', 
            delivered: row.getCell(3).value?.toString() || '' 
        };
        if(submission.handle != '' && submission.problem != '' && submission.delivered != '')
            existingSubmissions.push(submission);
        //console.log(row.values)
    });

    return existingSubmissions;

}

export async function WriteIntoExcel(submissions: Submission[], filePath: string){
    let existingSubmissions : AcceptedSubmission[] = [];

    if (fs.existsSync(filePath)) {
        existingSubmissions = await readSubmissionsFromExcel(filePath);
    }
    let nonExistingSubmissions: AcceptedSubmission[] 
        = await filterSubmissions(existingSubmissions,submissions);

    addSubmissionsToExcel(nonExistingSubmissions,filePath)
}

async function filterSubmissions(existingSubmissions: AcceptedSubmission[],submissions : Submission[]): Promise<AcceptedSubmission[]>{
    let nonExistingSubmissions: AcceptedSubmission[] 
    = submissions
        .filter(submission => {
            return !existingSubmissions.some(existingSubmission => {
                return existingSubmission.handle === submission.author.members[0].handle && existingSubmission.problem === submission.problem.index;
            });
        })
        .map(submission => {
            return {
                handle: submission.author.members[0].handle,
                problem: submission.problem.index,
                delivered: "NO"
            };
        });
    nonExistingSubmissions = removeDuplicateSubmissions(nonExistingSubmissions);
    return nonExistingSubmissions
}

function removeDuplicateSubmissions(AcceptedSubmission: AcceptedSubmission[]) : AcceptedSubmission[]{
    return AcceptedSubmission.filter((submission, index, self) =>
        index === self.findIndex(s => (
            s.handle === submission.handle && s.problem === submission.problem
        ))
    );
}