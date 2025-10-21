export type GuiElementDescriptor<T extends keyof CreatableInstances = keyof CreatableInstances> = {
    type: T;
    name?: string;
    properties?: Partial<InstanceProperties<CreatableInstances[T]>>;
    children?: GuiElementDescriptor[]; // Recursive
    onClick?: () => void;
    onMount?: (instance: Instance) => void;
};

export function buildGuiComponent<T extends keyof CreatableInstances>(
    descriptor: GuiElementDescriptor<T>,
    parent?: GuiObject | ScreenGui,
): CreatableInstances[T] {
    const instance = new Instance(descriptor.type) as CreatableInstances[T];

    if (descriptor.name) {
        instance.Name = descriptor.name;
    }

    if (descriptor.properties) {
        for (const [key, value] of pairs(descriptor.properties)) {
            (instance as any)[key as any] = value;
        }
    }

    if (descriptor.onClick && instance.IsA("TextButton")) {
        (instance as TextButton).MouseButton1Click.Connect(descriptor.onClick);
    }

    if (descriptor.children) {
        for (const childDesc of descriptor.children) {
            const child = buildGuiComponent(childDesc, instance as GuiObject);
            child.Parent = instance as GuiObject;
        }
    }

    if (descriptor.onMount) {
        descriptor.onMount(instance);
    }

    if (parent) {
        instance.Parent = parent;
    }

    return instance;
}