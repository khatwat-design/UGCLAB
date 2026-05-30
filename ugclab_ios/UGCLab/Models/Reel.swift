struct Reel: Codable, Identifiable {
    let id: String
    let creatorId: String
    let creatorName: String
    let creatorAvatar: String?
    let videoURL: String
    let thumbnailURL: String?
    let description: String?
    let likesCount: Int
    let viewsCount: Int
    let isLiked: Bool
    let isSaved: Bool
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, description
        case creatorId = "creator_id"
        case creatorName = "creator_name"
        case creatorAvatar = "creator_avatar"
        case videoURL = "video_url"
        case thumbnailURL = "thumbnail_url"
        case likesCount = "likes_count"
        case viewsCount = "views_count"
        case isLiked = "is_liked"
        case isSaved = "is_saved"
        case createdAt = "created_at"
    }
}
