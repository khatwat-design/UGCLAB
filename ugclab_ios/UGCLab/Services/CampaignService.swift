import Foundation

class CampaignService {
    static let shared = CampaignService()

    func exploreCampaigns(page: Int = 1) async throws -> [Campaign] {
        let response = try await APIClient.shared.get(APIEndpoint.exploreCampaigns, query: ["page": page, "per_page": Constants.pageSize])
        return decodeArray(from: response["data"] ?? response["campaigns"] ?? [])
    }

    func applyToCampaign(campaignId: String, proposal: String) async throws {
        _ = try await APIClient.shared.post(APIEndpoint.applyToCampaign(campaignId), body: ["proposal": proposal])
    }

    func getMyApplications(page: Int = 1) async throws -> [Application] {
        let response = try await APIClient.shared.get(APIEndpoint.creatorApplications, query: ["page": page, "per_page": Constants.pageSize])
        return decodeArray(from: response["data"] ?? response["applications"] ?? [])
    }

    func getAdvertiserCampaigns(page: Int = 1) async throws -> [Campaign] {
        let response = try await APIClient.shared.get(APIEndpoint.advertiserCampaigns, query: ["page": page, "per_page": Constants.pageSize])
        return decodeArray(from: response["data"] ?? response["campaigns"] ?? [])
    }

    func getCreatorCampaigns(page: Int = 1) async throws -> [Campaign] {
        let response = try await APIClient.shared.get(APIEndpoint.creatorCampaigns, query: ["page": page, "per_page": Constants.pageSize])
        return decodeArray(from: response["data"] ?? response["campaigns"] ?? [])
    }

    func getCampaignDetail(id: String) async throws -> Campaign {
        let response = try await APIClient.shared.get(APIEndpoint.advertiserCampaignDetail(id))
        guard let data = try? JSONSerialization.data(withJSONObject: response["campaign"] ?? response),
              let campaign = try? JSONDecoder().decode(Campaign.self, from: data)
        else { throw APIError.decoding }
        return campaign
    }

    func createCampaign(title: String, description: String, requirements: String?, budget: Double, category: String?, deadline: String?) async throws -> Campaign {
        var body: [String: Any] = ["title": title, "description": description, "budget": budget]
        body["requirements"] = requirements
        body["category"] = category
        body["deadline"] = deadline
        let response = try await APIClient.shared.post(APIEndpoint.advertiserCampaigns, body: body)
        guard let data = try? JSONSerialization.data(withJSONObject: response["campaign"] ?? response),
              let campaign = try? JSONDecoder().decode(Campaign.self, from: data)
        else { throw APIError.decoding }
        return campaign
    }

    func updateCampaign(id: String, title: String?, description: String?, requirements: String?, budget: Double?, category: String?, deadline: String?, status: String?) async throws -> Campaign {
        var body: [String: Any] = [:]
        body["title"] = title; body["description"] = description; body["requirements"] = requirements
        body["budget"] = budget; body["category"] = category; body["deadline"] = deadline; body["status"] = status
        let response = try await APIClient.shared.put(APIEndpoint.advertiserCampaignDetail(id), body: body)
        guard let data = try? JSONSerialization.data(withJSONObject: response["campaign"] ?? response),
              let campaign = try? JSONDecoder().decode(Campaign.self, from: data)
        else { throw APIError.decoding }
        return campaign
    }

    func deleteCampaign(id: String) async throws {
        _ = try await APIClient.shared.delete(APIEndpoint.advertiserCampaignDetail(id))
    }

    func getCampaignApplications(campaignId: String, page: Int = 1) async throws -> [Application] {
        let response = try await APIClient.shared.get(APIEndpoint.campaignApplications(campaignId), query: ["page": page, "per_page": Constants.pageSize])
        return decodeArray(from: response["data"] ?? response["applications"] ?? [])
    }

    func approveApplication(campaignId: String, applicationId: String) async throws {
        _ = try await APIClient.shared.post(APIEndpoint.approveApplication(campaignId, applicationId))
    }

    func rejectApplication(campaignId: String, applicationId: String) async throws {
        _ = try await APIClient.shared.post(APIEndpoint.rejectApplication(campaignId, applicationId))
    }

    func getDashboard() async throws -> [String: Any] {
        try await APIClient.shared.get(APIEndpoint.creatorDashboard)
    }

    func getAdvertiserDashboard() async throws -> [String: Any] {
        try await APIClient.shared.get(APIEndpoint.advertiserDashboard)
    }

    func getCreators(page: Int = 1) async throws -> [User] {
        let response = try await APIClient.shared.get(APIEndpoint.advertiserCreators, query: ["page": page, "per_page": Constants.pageSize])
        return decodeArray(from: response["data"] ?? response["creators"] ?? [])
    }

    func getCreatorProfile(id: String) async throws -> User {
        let response = try await APIClient.shared.get(APIEndpoint.creatorProfile(id))
        guard let data = try? JSONSerialization.data(withJSONObject: response["creator"] ?? response["user"] ?? response),
              let user = try? JSONDecoder().decode(User.self, from: data)
        else { throw APIError.decoding }
        return user
    }

    func inviteCreator(creatorId: String) async throws {
        _ = try await APIClient.shared.post(APIEndpoint.inviteCreator(creatorId))
    }

    private func decodeArray<T: Codable>(from json: Any) -> [T] {
        guard let data = try? JSONSerialization.data(withJSONObject: json),
              let items = try? JSONDecoder().decode([T].self, from: data)
        else { return [] }
        return items
    }
}
