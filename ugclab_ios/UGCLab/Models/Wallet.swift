struct Wallet: Codable {
    let id: String
    let balance: Double
    let pendingBalance: Double
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, balance
        case pendingBalance = "pending_balance"
        case createdAt = "created_at"
    }
}

struct Transaction: Codable, Identifiable {
    let id: String
    let type: String
    let amount: Double
    let fee: Double?
    let status: String
    let description: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, type, amount, fee, status, description
        case createdAt = "created_at"
    }
}
