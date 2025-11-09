export namespace Signal {
    let FreeRunnerThread: thread | undefined;

    function AcquireRunnerThreadAndCallEventHandler<T extends Callback>(fn: T, ...argsRaw: unknown[]) {
        const args = argsRaw as unknown as Parameters<T>;
        const acquired = FreeRunnerThread;
        FreeRunnerThread = undefined;
        fn(...(args as unknown[]));
        FreeRunnerThread = acquired;
    }

    function RunEventHandlerInFreeThread<T extends Callback>(fn: T, ...initialArgsRaw: unknown[]) {
        AcquireRunnerThreadAndCallEventHandler(fn, ...initialArgsRaw);
        while (true) {
            const yielded = coroutine.yield() as LuaTuple<unknown[]>;
            const args = yielded as unknown as Parameters<T>;
            AcquireRunnerThreadAndCallEventHandler(fn, ...(args as unknown[]));
        }
    }


    class Connection<T extends Callback> {
        public is_connected = true;
        public next?: Connection<T>;
        constructor(public listener: T, public signal: SignalClass<T>) { }

        Disconnect() {
            if (!this.is_connected) return;
            this.is_connected = false;
            this.signal.listener_count--;

            if (this.signal.head === this) {
                this.signal.head = this.next;
            } else {
                let prev = this.signal.head;
                while (prev && prev.next !== this) {
                    prev = prev.next;
                }
                if (prev) prev.next = this.next;
            }
        }
    }

    export class SignalClass<T extends Callback = Callback> {
        public head?: Connection<T>;
        public listener_count = 0;

        Connect(listener: T): Connection<T> {
            if (typeOf(listener) !== "function") {
                throw `Signal.Connect: listener must be a function, got ${typeOf(listener)}`;
            }
            const connection = new Connection(listener, this);
            connection.next = this.head;
            this.head = connection;
            this.listener_count++;
            return connection;
        }

        GetListenerCount(): number {
            return this.listener_count;
        }

        Fire(...argsRaw: unknown[]) {
            const args = argsRaw as Parameters<T>;
            let item = this.head;
            while (item) {
                if (item.is_connected) {
                    if (!FreeRunnerThread) {
                        FreeRunnerThread = coroutine.create(RunEventHandlerInFreeThread);
                    }
                    task.spawn(FreeRunnerThread, item.listener, ...(args as unknown as unknown[]));
                }
                item = item.next;
            }
        }

        Wait(): LuaTuple<Parameters<T>> {
            const co = coroutine.running();

            let connection: Connection<T>;

            const listener: T = ((...argsRaw: unknown[]) => {
                const args = argsRaw as Parameters<T>;
                connection.Disconnect();
                task.spawn(co, ...(args as unknown as unknown[]));
            }) as T;

            connection = this.Connect(listener);

            return coroutine.yield() as LuaTuple<Parameters<T>>;
        }
    }

    export function New<T extends Callback = Callback>(): SignalClass<T> {
        return new SignalClass<T>();
    }
}

