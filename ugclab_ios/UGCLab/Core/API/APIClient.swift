import Foundation

actor APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private var token: String?

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 15
        config.timeoutIntervalForResource = 30
        self.session = URLSession(configuration: config)
    }

    func setToken(_ token: String) { self.token = token }
    func removeToken() { self.token = nil }

    private func buildRequest(
        path: String,
        method: String = "GET",
        body: [String: Any]? = nil
    ) -> URLRequest {
        let url = URL(string: "\(Constants.apiBaseURL)\(path)")!
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        }
        return request
    }

    private func handleResponse(_ data: Data, _ response: URLResponse) throws -> [String: Any] {
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode)
        else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 500
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let message = json["message"] as? String {
                throw APIError.server(statusCode, message)
            }
            throw APIError.server(statusCode, "خطأ في الخادم")
        }

        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw APIError.decoding
        }
        return json
    }

    func get(_ path: String, query: [String: Any]? = nil) async throws -> [String: Any] {
        var finalPath = path
        if let query {
            var components = URLComponents(string: "\(Constants.apiBaseURL)\(path)")!
            components.queryItems = query.map { URLQueryItem(name: $0.key, value: "\($0.value)") }
            finalPath = components.url?.absoluteString.replacingOccurrences(of: Constants.apiBaseURL, with: "") ?? path
        }
        let request = buildRequest(path: finalPath)
        let (data, response) = try await session.data(for: request)
        return try handleResponse(data, response)
    }

    func post(_ path: String, body: [String: Any]? = nil) async throws -> [String: Any] {
        let request = buildRequest(path: path, method: "POST", body: body)
        let (data, response) = try await session.data(for: request)
        return try handleResponse(data, response)
    }

    func put(_ path: String, body: [String: Any]? = nil) async throws -> [String: Any] {
        let request = buildRequest(path: path, method: "PUT", body: body)
        let (data, response) = try await session.data(for: request)
        return try handleResponse(data, response)
    }

    func delete(_ path: String) async throws -> [String: Any] {
        let request = buildRequest(path: path, method: "DELETE")
        let (data, response) = try await session.data(for: request)
        return try handleResponse(data, response)
    }

    func upload(
        path: String,
        data: Data,
        fieldName: String = "file",
        fileName: String = "file.mp4",
        mimeType: String = "video/mp4",
        extraFields: [String: String]? = nil
    ) async throws -> [String: Any] {
        let url = URL(string: "\(Constants.apiBaseURL)\(path)")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        if let token { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }

        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()
        if let extraFields {
            for (key, value) in extraFields {
                body.append("--\(boundary)\r\n".data(using: .utf8)!)
                body.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
                body.append("\(value)\r\n".data(using: .utf8)!)
            }
        }
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"\(fieldName)\"; filename=\"\(fileName)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body
        let (responseData, response) = try await session.data(for: request)
        return try handleResponse(responseData, response)
    }
}
