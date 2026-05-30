struct Campaign: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let requirements: String?
    let budget: Double
    let platformFee: Double?
    let status: String
    let category: String?
    let deadline: String?
    let advertiserId: String
    let advertiserName: String?
    let advertiserAvatar: String?
    let applicationsCount: Int
    let createdAt: String?

    var isOpen: Bool { status == "open" }
    var isActive: Bool { status == "active" }

    enum CodingKeys: String, CodingKey {
        case id, title, description, requirements, budget, status, category, deadline
        case platformFee = "platform_fee"
        case advertiserId = "advertiser_id"
        case advertiserName = "advertiser_name"
        case advertiserAvatar = "advertiser_avatar"
        case applicationsCount = "applications_count"
        case createdAt = "created_at"
    }
}
