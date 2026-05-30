enum UserRole: String, Codable {
    case creator, advertiser
}

struct User: Codable, Identifiable {
    let id: String
    var name: String
    var email: String
    var phone: String
    let role: String
    var avatarURL: String?
    var bio: String?
    var isVerified: Bool
    var kycStatus: String?
    let createdAt: String?

    var isCreator: Bool { role == "creator" }
    var isAdvertiser: Bool { role == "advertiser" }

    enum CodingKeys: String, CodingKey {
        case id, name, email, phone, role, bio
        case avatarURL = "avatar_url"
        case isVerified = "is_verified"
        case kycStatus = "kyc_status"
        case createdAt = "created_at"
    }
}
