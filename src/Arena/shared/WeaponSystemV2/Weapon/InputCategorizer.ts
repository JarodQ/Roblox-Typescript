import { UserInputService } from "@rbxts/services";

type InputCategoryType = "KeyboardAndMouse" | "Gamepad" | "Touch" | "Unknown";

const InputCategory = {
    KeyboardAndMouse: "KeyboardAndMouse",
    Gamepad: "Gamepad",
    Touch: "Touch",
    Unknown: "Unknown",
} as const;

const lastInputCategoryChangedEvent = new Instance("BindableEvent");

const InputCategorizer = {
    InputCategory,
    lastInputCategoryChanged: lastInputCategoryChangedEvent.Event,
    _lastInputCategory: InputCategory.Unknown as InputCategoryType,
    _initialized: false,

    getLastInputCategory(): InputCategoryType {
        return this._lastInputCategory;
    },

    _setLastInputCategory(inputCategory: InputCategoryType): void {
        if (this._lastInputCategory !== inputCategory) {
            this._lastInputCategory = inputCategory;
            lastInputCategoryChangedEvent.Fire(inputCategory);
        }
    },

    _getCategoryOfInputType(inputType: Enum.UserInputType): InputCategoryType {
        if (inputType.Name.find("Gamepad") !== undefined) {
            return InputCategory.Gamepad;
        } else if (
            inputType === Enum.UserInputType.Keyboard ||
            inputType.Name.find("Mouse") !== undefined
        ) {
            return InputCategory.KeyboardAndMouse;
        } else if (inputType === Enum.UserInputType.Touch) {
            return InputCategory.Touch;
        } else {
            return InputCategory.Unknown;
        }
    },

    _onInputTypeChanged(inputType: Enum.UserInputType): void {
        const inputCategory = this._getCategoryOfInputType(inputType);
        if (inputCategory !== InputCategory.Unknown) {
            this._setLastInputCategory(inputCategory);
        }
    },

    _getDefaultInputCategory(): InputCategoryType {
        const lastInputType = UserInputService.GetLastInputType();
        const lastInputCategory = this._getCategoryOfInputType(lastInputType);

        if (lastInputCategory !== InputCategory.Unknown) {
            return lastInputCategory;
        }

        if (UserInputService.KeyboardEnabled && UserInputService.MouseEnabled) {
            return InputCategory.KeyboardAndMouse;
        } else if (UserInputService.TouchEnabled) {
            return InputCategory.Touch;
        } else if (UserInputService.GamepadEnabled) {
            return InputCategory.Gamepad;
        } else {
            warn("No input devices detected!");
            return InputCategory.Unknown;
        }
    },

    _initialize(): void {
        assert(!this._initialized, "InputCategorizer already initialized!");

        UserInputService.LastInputTypeChanged.Connect((inputType) => {
            this._onInputTypeChanged(inputType);
        });

        const defaultInputCategory = this._getDefaultInputCategory();
        this._setLastInputCategory(defaultInputCategory);

        this._initialized = true;
    },
};

InputCategorizer._initialize();

export default InputCategorizer;
