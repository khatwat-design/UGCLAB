struct Application: Codable, Identifiable {
    let id: String
    let campaignId: String
    let campaignTitle: String
    let creatorId: String
    let creatorName: String
    let creatorAvatar: String?
    let status: String
    let proposal: String?
    let createdAt: String?

    var isPending: Bool { status == "pending" }
    var isApproved: Bool { status == "approved" }
    var isRejected: Bool { status == "rejected" }

    enum CodingKeys: String, CodingKey {
        case id, status, proposal
        case campaignId = "campaign_id"
        case campaignTitle = "campaign_title"
        case creatorId = "creator_id"
        case creatorName = "creator_name"
        case creatorAvatar = "creator_avatar"
        case createdAt = "created_at"
    }
}
