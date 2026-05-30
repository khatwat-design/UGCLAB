import Foundation

class ReelService {
    static let shared = ReelService()

    func getReels(page: Int = 1) async throws -> [Reel] {
        let response = try await APIClient.shared.get(APIEndpoint.reels, query: ["page": page, "per_page": Constants.pageSize])
        return decodeArray(from: response["data"] ?? response["reels"] ?? [])
    }

    func getMyReels(page: Int = 1) async throws -> [Reel] {
        let response = try await APIClient.shared.get(APIEndpoint.creatorReels, query: ["page": page, "per_page": Constants.pageSize])
        return decodeArray(from: response["data"] ?? response["reels"] ?? [])
    }

    func uploadReel(videoData: Data, description: String?, thumbnailData: Data? = nil) async throws -> Reel {
        var extraFields: [String: String] = [:]
        extraFields["description"] = description
        let response = try await APIClient.shared.upload(path: APIEndpoint.mediaUpload, data: videoData, fieldName: "file", fileName: "reel.mp4", mimeType: "video/mp4", extraFields: extraFields)
        guard let data = try? JSONSerialization.data(withJSONObject: response["reel"] ?? response),
              let reel = try? JSONDecoder().decode(Reel.self, from: data)
        else { throw APIError.decoding }
        return reel
    }

    func deleteReel(id: String) async throws {
        _ = try await APIClient.shared.delete(APIEndpoint.deleteCreatorReel(id))
    }

    func likeReel(id: String) async throws {
        _ = try await APIClient.shared.post(APIEndpoint.reelLike(id))
    }

    func saveReel(id: String) async throws {
        _ = try await APIClient.shared.post(APIEndpoint.reelSave(id))
    }

    private func decodeArray<T: Codable>(from json: Any) -> [T] {
        guard let data = try? JSONSerialization.data(withJSONObject: json),
              let items = try? JSONDecoder().decode([T].self, from: data)
        else { return [] }
        return items
    }
}
