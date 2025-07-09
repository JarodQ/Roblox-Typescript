import { UserInputService } from "@rbxts/services";

export type InputCategoryType = "KeyboardAndMouse" | "Gamepad" | "Touch" | "Unknown";

const lastInputCategoryChangedEvent = new Instance("BindableEvent");

export const InputCategory = {
    KeyboardAndMouse: "KeyboardAndMouse" as InputCategoryType,
    Gamepad: "Gamepad" as InputCategoryType,
    Touch: "Touch" as InputCategoryType,
    Unknown: "Unknown" as InputCategoryType,
};

export namespace InputCategorizer {
    let _lastInputCategory: InputCategoryType = InputCategory.Unknown;
    let _initialized = false;

    export const lastInputCategoryChanged = lastInputCategoryChangedEvent.Event;

    /**
     * Returns the most recently detected input category.
     */
    export function getLastInputCategory(): InputCategoryType {
        return _lastInputCategory;
    }

    function _setLastInputCategory(inputCategory: InputCategoryType): void {
        if (_lastInputCategory !== inputCategory) {
            _lastInputCategory = inputCategory;
            lastInputCategoryChangedEvent.Fire(inputCategory);
        }
    }

    function _getCategoryOfInputType(inputType: Enum.UserInputType): InputCategoryType {
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
    }

    function _onInputTypeChanged(inputType: Enum.UserInputType): void {
        const inputCategory = _getCategoryOfInputType(inputType);
        if (inputCategory !== InputCategory.Unknown) {
            _setLastInputCategory(inputCategory);
        }
    }

    function _getDefaultInputCategory(): InputCategoryType {
        const lastInputType = UserInputService.GetLastInputType();
        const lastInputCategory = _getCategoryOfInputType(lastInputType);

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
    }

    function _initialize(): void {
        assert(!_initialized, "InputCategorizer already initialized!");

        UserInputService.LastInputTypeChanged.Connect(_onInputTypeChanged);

        const defaultInputCategory = _getDefaultInputCategory();
        _setLastInputCategory(defaultInputCategory);

        _initialized = true;
    }

    _initialize();
}