struct Message: Codable, Identifiable {
    let id: String
    let senderId: String
    let senderName: String
    let senderAvatar: String?
    let receiverId: String
    let receiverName: String
    let receiverAvatar: String?
    let content: String
    let isRead: Bool
    let createdAt: String?

    var isMine: Bool { senderId == currentUserId }
    static var currentUserId = ""

    enum CodingKeys: String, CodingKey {
        case id, content
        case senderId = "sender_id"
        case senderName = "sender_name"
        case senderAvatar = "sender_avatar"
        case receiverId = "receiver_id"
        case receiverName = "receiver_name"
        case receiverAvatar = "receiver_avatar"
        case isRead = "is_read"
        case createdAt = "created_at"
    }
}
