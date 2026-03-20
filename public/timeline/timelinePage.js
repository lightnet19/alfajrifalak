import { generateMonthlyPrediction } from "./monthlyPrediction.js";
import { renderTimeline } from "../js/timelineRenderer.js";

const startBtn = document.getElementById("generateTimeline");
const container = document.getElementById("timelineContainer");
const latInput = document.getElementById("timelineLat");
const lonInput = document.getElementById("timelineLon");
const tzInput = document.getElementById("timelineTz");
const dateInput = document.getElementById("timelineDate");

dateInput.value = new Date().toISOString().slice(0, 10);

startBtn.addEventListener("click", () => {
  const startDate = dateInput.value ? new Date(dateInput.value + "T00:00:00") : new Date();
  const lat = parseFloat(latInput.value) || -8.17;
  const lon = parseFloat(lonInput.value) || 113.71;
  const tz = parseFloat(tzInput.value) || 7;

  const data = generateMonthlyPrediction({ startDate, lat, lon, tz, days: 30 });
  renderTimeline(container, data);
});
