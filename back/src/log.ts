export const log = (message: string, params: unknown = undefined) => {
    console.log(`${new Date().toISOString()} ${message}${params !== undefined ? ` ${JSON.stringify(params)}` : ''}`);
}