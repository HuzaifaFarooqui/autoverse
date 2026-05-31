export class Action {
    async execute(action: any): Promise<void> {
        console.log('Executing action:', action);
    }
}
