struct KycDocument: Codable, Identifiable {
    let id: String
    let type: String
    let status: String
    let fileURL: String?
    let notes: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, type, status, notes
        case fileURL = "file_url"
        case createdAt = "created_at"
    }
}
