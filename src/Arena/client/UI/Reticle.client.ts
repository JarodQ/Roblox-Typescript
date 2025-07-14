import { Players } from "@rbxts/services";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui");
const reticlGui = playerGui.WaitForChild("ReticleGui");
const mainFrame = reticlGui.WaitForChild("Main") as Frame;
const reticle = mainFrame.WaitForChild("Reticle") as CanvasGroup;

reticle.Visible = true; // Set false while in menus or cutscenes