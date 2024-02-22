import { Command } from 'commander';


import CodeforcesClient from '@acmascis/codeforces-client';

import { getStatusData } from './services/status';
import { WriteIntoExcel } from './services/files_manager/excel';
(async function () {
    const program = new Command();

    program
        .requiredOption('--key <key>', 'cf api key')
        .requiredOption('--secret <secret>', 'cf api secret')
        .requiredOption('--contest <contest-id>', 'cf contest id');
    program.parse(process.argv);

    const { key, secret, contest } = program.opts();
    const client = new CodeforcesClient(key, secret);
    const { submissions } = await getStatusData(client, contest);
    console.log("HERRERERERE")
    WriteIntoExcel(submissions,"test2.xlsx")
    
})();

