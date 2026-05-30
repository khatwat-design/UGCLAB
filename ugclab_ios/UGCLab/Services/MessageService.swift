import Foundation

class MessageService {
    static let shared = MessageService()

    func getConversations() async throws -> [Message] {
        let response = try await APIClient.shared.get(APIEndpoint.messages, query: ["per_page": 50])
        return decodeArray(from: response["data"] ?? response["messages"] ?? [])
    }

    func getConversation(with userId: String, page: Int = 1) async throws -> [Message] {
        let response = try await APIClient.shared.get(APIEndpoint.conversation(userId), query: ["page": page, "per_page": Constants.pageSize])
        return decodeArray(from: response["data"] ?? response["messages"] ?? [])
    }

    func sendMessage(to userId: String, content: String) async throws -> Message {
        let response = try await APIClient.shared.post(APIEndpoint.conversation(userId), body: ["content": content])
        guard let data = try? JSONSerialization.data(withJSONObject: response["message"] ?? response),
              let message = try? JSONDecoder().decode(Message.self, from: data)
        else { throw APIError.decoding }
        return message
    }

    func markAsRead(messageId: String) async throws {
        _ = try await APIClient.shared.post(APIEndpoint.markRead(messageId))
    }

    private func decodeArray<T: Codable>(from json: Any) -> [T] {
        guard let data = try? JSONSerialization.data(withJSONObject: json),
              let items = try? JSONDecoder().decode([T].self, from: data)
        else { return [] }
        return items
    }
}
