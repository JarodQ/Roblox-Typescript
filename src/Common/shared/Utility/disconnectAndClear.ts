export default function disconnectAndClear(connections: RBXScriptConnection[]): void {
    for (const connection of connections) {
        connection.Disconnect();
    }
    connections.clear();
}
