struct APIEndpoint {
    static let health = "/health"
    static let login = "/auth/login"
    static let register = "/auth/register"
    static let logout = "/auth/logout"
    static let me = "/auth/me"
    static let updateProfile = "/auth/profile"
    static let updatePassword = "/auth/password"

    static let exploreCampaigns = "/campaigns/explore"

    static let reels = "/reels"
    static func reelLike(_ id: String) -> String { "/reels/\(id)/like" }
    static func reelSave(_ id: String) -> String { "/reels/\(id)/save" }

    static let creatorDashboard = "/creator/dashboard"
    static let creatorCampaigns = "/creator/campaigns"
    static func applyToCampaign(_ id: String) -> String { "/creator/campaigns/\(id)/apply" }
    static let creatorApplications = "/creator/applications"
    static func submitDeliverable(_ id: String) -> String { "/creator/deliverables/\(id)" }
    static let creatorReels = "/creator/reels"
    static func deleteCreatorReel(_ id: String) -> String { "/creator/reels/\(id)" }
    static let creatorEarnings = "/creator/earnings"

    static let advertiserDashboard = "/advertiser/dashboard"
    static let advertiserCampaigns = "/advertiser/campaigns"
    static func advertiserCampaignDetail(_ id: String) -> String { "/advertiser/campaigns/\(id)" }
    static func campaignApplications(_ id: String) -> String { "/advertiser/campaigns/\(id)/applications" }
    static func approveApplication(_ cId: String, _ aId: String) -> String { "/advertiser/campaigns/\(cId)/applications/\(aId)/approve" }
    static func rejectApplication(_ cId: String, _ aId: String) -> String { "/advertiser/campaigns/\(cId)/applications/\(aId)/reject" }
    static func approveDeliverable(_ id: String) -> String { "/advertiser/deliverables/\(id)/approve" }
    static func rejectDeliverable(_ id: String) -> String { "/advertiser/deliverables/\(id)/reject" }
    static func requestRevision(_ id: String) -> String { "/advertiser/deliverables/\(id)/request-revision" }
    static func inviteCreator(_ id: String) -> String { "/advertiser/invite/\(id)" }
    static let advertiserCreators = "/advertiser/creators"

    static let messages = "/messages"
    static func conversation(_ userId: String) -> String { "/messages/conversation/\(userId)" }
    static func markRead(_ id: String) -> String { "/messages/\(id)/read" }

    static let notifications = "/notifications"
    static func markNotificationRead(_ id: String) -> String { "/notifications/\(id)/read" }
    static let unreadCount = "/notifications/unread-count"

    static let wallet = "/wallet"
    static let deposit = "/payments/deposit"
    static let withdraw = "/payments/withdraw"
    static let transactions = "/payments/transactions"

    static let kycUpload = "/kyc/upload"
    static let kycMyDocuments = "/kyc/my-documents"

    static let creators = "/creators"
    static func creatorProfile(_ id: String) -> String { "/creators/\(id)" }

    static let mediaUpload = "/media/upload"
    static func deleteMedia(_ id: String) -> String { "/media/\(id)" }
}
