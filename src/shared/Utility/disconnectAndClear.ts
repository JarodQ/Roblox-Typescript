/**
 * Disconnects all RBXScriptConnections in the array and clears it.
 *
 * @param connections - An array of RBXScriptConnections to disconnect and clear
 */
export function disconnectAndClear(connections: RBXScriptConnection[]): void {
    for (const connection of connections) {
        connection.Disconnect();
    }
    connections.clear();
}