export const API_URL = "http://192.168.129.8:5000";

export const resolveMediaUrl = (uri: string): string => {
	if (!uri) return uri;
	if (uri.startsWith("http://") || uri.startsWith("https://")) return uri;
	if (uri.startsWith("/")) return `${API_URL}${uri}`;
	return `${API_URL}/${uri}`;
};
