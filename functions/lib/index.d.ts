export declare const autoCategorizeTasks: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    taskId: string;
}>>;
export declare const breakdownTask: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    count: any;
}>, unknown>;
export declare const askCopilot: import("firebase-functions/v2/https").CallableFunction<{
    message: string;
    userId: string;
}, Promise<{
    reply: string;
}>, unknown>;
//# sourceMappingURL=index.d.ts.map