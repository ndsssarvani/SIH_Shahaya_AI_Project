import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
	baseURL: API_URL,
	headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export async function login(email, password, remember = false) {
	const body = new URLSearchParams({ username: email, password });
	const { data } = await api.post("/auth/login", body, {
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
	});
	const storage = remember ? localStorage : sessionStorage;
	storage.setItem("access_token", data.access_token);
	return data;
}

export async function register(name, email, password, role) {
	const { data } = await api.post("/auth/register", {
		name,
		email,
		password,
		role: role === "officer" ? "officer" : "victim",
	});
	return data;
}

export function logout() {
	localStorage.removeItem("access_token");
	sessionStorage.removeItem("access_token");
}

export function getStoredToken() {
	return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
}

// Victim Assessment
export async function submitAssessment({
	text = "",
	channel = "chatbot",
	consent_given = true,
	audio = null,
} = {}) {
	if (audio) {
		const formData = new FormData();
		formData.append("text", text);
		formData.append("channel", channel);
		formData.append("consent_given", consent_given ? "true" : "false");
		formData.append("audio", audio);

		const { data } = await api.post("/assessment/submit", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return data;
	}

	const { data } = await api.post(
		"/assessment/submit",
		{
			text,
			channel,
			consent_given,
		},
		{
			headers: { "Content-Type": "application/json" },
		}
	);
	return data;
}

export async function getAssessment(id) {
	const { data } = await api.get(`/assessment/${id}`);
	return data;
}

// Officer Dashboard & Analytics
export async function getDashboard() {
	const { data } = await api.get("/officer/dashboard");
	return data;
}

export async function getAnalytics() {
	const { data } = await api.get("/officer/analytics");
	return data;
}

export async function getWorklist(limit = 50) {
	const { data } = await api.get(`/officer/worklist?limit=${limit}`);
	return data;
}

// Alerts
export async function getAlerts() {
	const { data } = await api.get("/alerts/");
	return data;
}

export async function acknowledgeAlert(alertId) {
	const { data } = await api.post(`/alerts/${alertId}/acknowledge`);
	return data;
}

// Complaints
export async function submitComplaint(description) {
	const { data } = await api.post("/complaint/", { description });
	return data;
}

export async function getComplaints() {
	const { data } = await api.get("/complaint/");
	return data;
}

// Support Resources
export async function getSupportResources() {
	const { data } = await api.get("/support/resources");
	return data;
}

