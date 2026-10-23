import {z} from 'zod';
const id=z.uuid(),code=z.string().regex(/^\d{6}$/);
export const mfaInput=z.discriminatedUnion('action',[
 z.object({action:z.literal('enroll'),proofFactorId:id.optional(),code:code.optional()}).strict(),
 z.object({action:z.literal('verify'),factorId:id,code}).strict(),
 z.object({action:z.literal('cancel'),factorId:id}).strict(),
 z.object({action:z.literal('remove'),factorId:id,proofFactorId:id,code}).strict(),
]);
