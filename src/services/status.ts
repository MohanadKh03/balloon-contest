import _ from 'lodash';
import CodeforcesClient from '@acmascis/codeforces-client';
import { Submission } from '@acmascis/codeforces-client/build/interfaces/submission.interface';

export const getStatusData = async (client: CodeforcesClient, contestId: string) => {
    const contestStatus = await client.contest.status({ contestId: contestId });
    if (contestStatus.status === 'FAILED') {
        console.error('Failed to fetch contest status: ', contestStatus.comment);
        process.exit(1);
    }
    console.log(contestStatus.result)
    const submissions = await getSubmissions(contestStatus.result);

    return { submissions };
};

const getSubmissions = async (submissions: Submission[]) => {
    submissions = _.filter(submissions, (submission) => submission.author.participantType === 'CONTESTANT' && submission.verdict === 'OK');
    return submissions;
};
