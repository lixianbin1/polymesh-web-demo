const SystemTx = {
	FillBlock: 'system.fillBlock',
	Remark: 'system.remark',
	SetHeapPages: 'system.setHeapPages',
	SetCode: 'system.setCode',
	SetCodeWithoutChecks: 'system.setCodeWithoutChecks',
	SetChangesTrieConfig: 'system.setChangesTrieConfig',
	SetStorage: 'system.setStorage',
	KillStorage: 'system.killStorage',
	KillPrefix: 'system.killPrefix',
	RemarkWithEvent: 'system.remarkWithEvent'
}

const BabeTx = {
	ReportEquivocation: 'babe.reportEquivocation',
	ReportEquivocationUnsigned: 'babe.reportEquivocationUnsigned',
	PlanConfigChange: 'babe.planConfigChange'
}

const TimestampTx = {
	Set: 'timestamp.set'
}

const IndicesTx = {
	Claim: 'indices.claim',
	Transfer: 'indices.transfer',
	Free: 'indices.free',
	ForceTransfer: 'indices.forceTransfer',
	Freeze: 'indices.freeze'
}

const AuthorshipTx = {
	SetUncles: 'authorship.setUncles'
}

const BalancesTx = {
	Transfer: 'balances.transfer',
	TransferWithMemo: 'balances.transferWithMemo',
	DepositBlockRewardReserveBalance: 'balances.depositBlockRewardReserveBalance',
	SetBalance: 'balances.setBalance',
	ForceTransfer: 'balances.forceTransfer',
	BurnAccountBalance: 'balances.burnAccountBalance'
}

const IdentityTx = {
	CddRegisterDid: 'identity.cddRegisterDid',
	InvalidateCddClaims: 'identity.invalidateCddClaims',
	RemoveSecondaryKeys: 'identity.removeSecondaryKeys',
	AcceptPrimaryKey: 'identity.acceptPrimaryKey',
	ChangeCddRequirementForMkRotation: 'identity.changeCddRequirementForMkRotation',
	JoinIdentityAsKey: 'identity.joinIdentityAsKey',
	LeaveIdentityAsKey: 'identity.leaveIdentityAsKey',
	AddClaim: 'identity.addClaim',
	RevokeClaim: 'identity.revokeClaim',
	SetPermissionToSigner: 'identity.setPermissionToSigner',
	LegacySetPermissionToSigner: 'identity.legacySetPermissionToSigner',
	FreezeSecondaryKeys: 'identity.freezeSecondaryKeys',
	UnfreezeSecondaryKeys: 'identity.unfreezeSecondaryKeys',
	AddAuthorization: 'identity.addAuthorization',
	RemoveAuthorization: 'identity.removeAuthorization',
	AddSecondaryKeysWithAuthorization: 'identity.addSecondaryKeysWithAuthorization',
	AddInvestorUniquenessClaim: 'identity.addInvestorUniquenessClaim',
	GcAddCddClaim: 'identity.gcAddCddClaim',
	GcRevokeCddClaim: 'identity.gcRevokeCddClaim',
	AddInvestorUniquenessClaimV2: 'identity.addInvestorUniquenessClaimV2',
	RevokeClaimByIndex: 'identity.revokeClaimByIndex',
	RotatePrimaryKeyToSecondary: 'identity.rotatePrimaryKeyToSecondary',
	RemoveSecondaryKeysOld: 'identity.removeSecondaryKeysOld',
	PlaceholderLegacySetPermissionToSigner: 'identity.placeholderLegacySetPermissionToSigner',
	AddSecondaryKeysWithAuthorizationOld: 'identity.addSecondaryKeysWithAuthorizationOld',
	SetSecondaryKeyPermissions: 'identity.setSecondaryKeyPermissions'
}

const CddServiceProvidersTx = {
	SetActiveMembersLimit: 'cddServiceProviders.setActiveMembersLimit',
	DisableMember: 'cddServiceProviders.disableMember',
	AddMember: 'cddServiceProviders.addMember',
	RemoveMember: 'cddServiceProviders.removeMember',
	SwapMember: 'cddServiceProviders.swapMember',
	ResetMembers: 'cddServiceProviders.resetMembers',
	AbdicateMembership: 'cddServiceProviders.abdicateMembership'
}

const PolymeshCommitteeTx = {
	SetVoteThreshold: 'polymeshCommittee.setVoteThreshold',
	SetReleaseCoordinator: 'polymeshCommittee.setReleaseCoordinator',
	SetExpiresAfter: 'polymeshCommittee.setExpiresAfter',
	VoteOrPropose: 'polymeshCommittee.voteOrPropose',
	Vote: 'polymeshCommittee.vote'
}

const CommitteeMembershipTx = {
	SetActiveMembersLimit: 'committeeMembership.setActiveMembersLimit',
	DisableMember: 'committeeMembership.disableMember',
	AddMember: 'committeeMembership.addMember',
	RemoveMember: 'committeeMembership.removeMember',
	SwapMember: 'committeeMembership.swapMember',
	ResetMembers: 'committeeMembership.resetMembers',
	AbdicateMembership: 'committeeMembership.abdicateMembership'
}

const TechnicalCommitteeTx = {
	SetVoteThreshold: 'technicalCommittee.setVoteThreshold',
	SetReleaseCoordinator: 'technicalCommittee.setReleaseCoordinator',
	SetExpiresAfter: 'technicalCommittee.setExpiresAfter',
	VoteOrPropose: 'technicalCommittee.voteOrPropose',
	Vote: 'technicalCommittee.vote'
}

const TechnicalCommitteeMembershipTx = {
	SetActiveMembersLimit: 'technicalCommitteeMembership.setActiveMembersLimit',
	DisableMember: 'technicalCommitteeMembership.disableMember',
	AddMember: 'technicalCommitteeMembership.addMember',
	RemoveMember: 'technicalCommitteeMembership.removeMember',
	SwapMember: 'technicalCommitteeMembership.swapMember',
	ResetMembers: 'technicalCommitteeMembership.resetMembers',
	AbdicateMembership: 'technicalCommitteeMembership.abdicateMembership'
}

const UpgradeCommitteeTx = {
	SetVoteThreshold: 'upgradeCommittee.setVoteThreshold',
	SetReleaseCoordinator: 'upgradeCommittee.setReleaseCoordinator',
	SetExpiresAfter: 'upgradeCommittee.setExpiresAfter',
	VoteOrPropose: 'upgradeCommittee.voteOrPropose',
	Vote: 'upgradeCommittee.vote'
}

const UpgradeCommitteeMembershipTx = {
	SetActiveMembersLimit: 'upgradeCommitteeMembership.setActiveMembersLimit',
	DisableMember: 'upgradeCommitteeMembership.disableMember',
	AddMember: 'upgradeCommitteeMembership.addMember',
	RemoveMember: 'upgradeCommitteeMembership.removeMember',
	SwapMember: 'upgradeCommitteeMembership.swapMember',
	ResetMembers: 'upgradeCommitteeMembership.resetMembers',
	AbdicateMembership: 'upgradeCommitteeMembership.abdicateMembership'
}

const MultiSigTx = {
	CreateMultisig: 'multiSig.createMultisig',
	CreateOrApproveProposalAsIdentity: 'multiSig.createOrApproveProposalAsIdentity',
	CreateOrApproveProposalAsKey: 'multiSig.createOrApproveProposalAsKey',
	CreateProposalAsIdentity: 'multiSig.createProposalAsIdentity',
	CreateProposalAsKey: 'multiSig.createProposalAsKey',
	ApproveAsIdentity: 'multiSig.approveAsIdentity',
	ApproveAsKey: 'multiSig.approveAsKey',
	RejectAsIdentity: 'multiSig.rejectAsIdentity',
	RejectAsKey: 'multiSig.rejectAsKey',
	AcceptMultisigSignerAsIdentity: 'multiSig.acceptMultisigSignerAsIdentity',
	AcceptMultisigSignerAsKey: 'multiSig.acceptMultisigSignerAsKey',
	AddMultisigSigner: 'multiSig.addMultisigSigner',
	RemoveMultisigSigner: 'multiSig.removeMultisigSigner',
	AddMultisigSignersViaCreator: 'multiSig.addMultisigSignersViaCreator',
	RemoveMultisigSignersViaCreator: 'multiSig.removeMultisigSignersViaCreator',
	ChangeSigsRequired: 'multiSig.changeSigsRequired',
	MakeMultisigSigner: 'multiSig.makeMultisigSigner',
	MakeMultisigPrimary: 'multiSig.makeMultisigPrimary',
	ExecuteScheduledProposal: 'multiSig.executeScheduledProposal',
	MakeMultisigSecondary: 'multiSig.makeMultisigSecondary'
}

const BridgeTx = {
	ChangeController: 'bridge.changeController',
	ChangeAdmin: 'bridge.changeAdmin',
	ChangeTimelock: 'bridge.changeTimelock',
	Freeze: 'bridge.freeze',
	Unfreeze: 'bridge.unfreeze',
	ChangeBridgeLimit: 'bridge.changeBridgeLimit',
	ChangeBridgeExempted: 'bridge.changeBridgeExempted',
	ForceHandleBridgeTx: 'bridge.forceHandleBridgeTx',
	BatchProposeBridgeTx: 'bridge.batchProposeBridgeTx',
	ProposeBridgeTx: 'bridge.proposeBridgeTx',
	HandleBridgeTx: 'bridge.handleBridgeTx',
	FreezeTxs: 'bridge.freezeTxs',
	UnfreezeTxs: 'bridge.unfreezeTxs',
	HandleScheduledBridgeTx: 'bridge.handleScheduledBridgeTx',
	AddFreezeAdmin: 'bridge.addFreezeAdmin',
	RemoveFreezeAdmin: 'bridge.removeFreezeAdmin',
	RemoveTxs: 'bridge.removeTxs'
}

const StakingTx = {
	Bond: 'staking.bond',
	BondExtra: 'staking.bondExtra',
	Unbond: 'staking.unbond',
	WithdrawUnbonded: 'staking.withdrawUnbonded',
	Validate: 'staking.validate',
	Nominate: 'staking.nominate',
	Chill: 'staking.chill',
	SetPayee: 'staking.setPayee',
	SetController: 'staking.setController',
	SetValidatorCount: 'staking.setValidatorCount',
	IncreaseValidatorCount: 'staking.increaseValidatorCount',
	ScaleValidatorCount: 'staking.scaleValidatorCount',
	AddPermissionedValidator: 'staking.addPermissionedValidator',
	RemovePermissionedValidator: 'staking.removePermissionedValidator',
	ValidateCddExpiryNominators: 'staking.validateCddExpiryNominators',
	SetCommissionCap: 'staking.setCommissionCap',
	SetMinBondThreshold: 'staking.setMinBondThreshold',
	ForceNoEras: 'staking.forceNoEras',
	ForceNewEra: 'staking.forceNewEra',
	SetInvulnerables: 'staking.setInvulnerables',
	ForceUnstake: 'staking.forceUnstake',
	ForceNewEraAlways: 'staking.forceNewEraAlways',
	CancelDeferredSlash: 'staking.cancelDeferredSlash',
	PayoutStakers: 'staking.payoutStakers',
	Rebond: 'staking.rebond',
	SetHistoryDepth: 'staking.setHistoryDepth',
	ReapStash: 'staking.reapStash',
	SubmitElectionSolution: 'staking.submitElectionSolution',
	SubmitElectionSolutionUnsigned: 'staking.submitElectionSolutionUnsigned',
	PayoutStakersBySystem: 'staking.payoutStakersBySystem',
	ChangeSlashingAllowedFor: 'staking.changeSlashingAllowedFor',
	UpdatePermissionedValidatorIntendedCount: 'staking.updatePermissionedValidatorIntendedCount'
}

const SessionTx = {
	SetKeys: 'session.setKeys',
	PurgeKeys: 'session.purgeKeys'
}

const GrandpaTx = {
	ReportEquivocation: 'grandpa.reportEquivocation',
	ReportEquivocationUnsigned: 'grandpa.reportEquivocationUnsigned',
	NoteStalled: 'grandpa.noteStalled'
}

const ImOnlineTx = {
	Heartbeat: 'imOnline.heartbeat'
}

const SudoTx = {
	Sudo: 'sudo.sudo',
	SudoUncheckedWeight: 'sudo.sudoUncheckedWeight',
	SetKey: 'sudo.setKey',
	SudoAs: 'sudo.sudoAs'
}

const AssetTx = {
	RegisterTicker: 'asset.registerTicker',
	AcceptTickerTransfer: 'asset.acceptTickerTransfer',
	AcceptAssetOwnershipTransfer: 'asset.acceptAssetOwnershipTransfer',
	CreateAsset: 'asset.createAsset',
	Freeze: 'asset.freeze',
	Unfreeze: 'asset.unfreeze',
	RenameAsset: 'asset.renameAsset',
	Issue: 'asset.issue',
	Redeem: 'asset.redeem',
	MakeDivisible: 'asset.makeDivisible',
	AddDocuments: 'asset.addDocuments',
	RemoveDocuments: 'asset.removeDocuments',
	SetFundingRound: 'asset.setFundingRound',
	UpdateIdentifiers: 'asset.updateIdentifiers',
	ClaimClassicTicker: 'asset.claimClassicTicker',
	ReserveClassicTicker: 'asset.reserveClassicTicker',
	ControllerTransfer: 'asset.controllerTransfer',
	RegisterCustomAssetType: 'asset.registerCustomAssetType',
	CreateAssetWithCustomType: 'asset.createAssetWithCustomType',
	SetAssetMetadata: 'asset.setAssetMetadata',
	SetAssetMetadataDetails: 'asset.setAssetMetadataDetails',
	RegisterAndSetLocalAssetMetadata: 'asset.registerAndSetLocalAssetMetadata',
	RegisterAssetMetadataLocalType: 'asset.registerAssetMetadataLocalType',
	RegisterAssetMetadataGlobalType: 'asset.registerAssetMetadataGlobalType'
}

const CapitalDistributionTx = {
	Distribute: 'capitalDistribution.distribute',
	Claim: 'capitalDistribution.claim',
	PushBenefit: 'capitalDistribution.pushBenefit',
	Reclaim: 'capitalDistribution.reclaim',
	RemoveDistribution: 'capitalDistribution.removeDistribution'
}

const CheckpointTx = {
	CreateCheckpoint: 'checkpoint.createCheckpoint',
	SetSchedulesMaxComplexity: 'checkpoint.setSchedulesMaxComplexity',
	CreateSchedule: 'checkpoint.createSchedule',
	RemoveSchedule: 'checkpoint.removeSchedule'
}

const ComplianceManagerTx = {
	AddComplianceRequirement: 'complianceManager.addComplianceRequirement',
	RemoveComplianceRequirement: 'complianceManager.removeComplianceRequirement',
	ReplaceAssetCompliance: 'complianceManager.replaceAssetCompliance',
	ResetAssetCompliance: 'complianceManager.resetAssetCompliance',
	PauseAssetCompliance: 'complianceManager.pauseAssetCompliance',
	ResumeAssetCompliance: 'complianceManager.resumeAssetCompliance',
	AddDefaultTrustedClaimIssuer: 'complianceManager.addDefaultTrustedClaimIssuer',
	RemoveDefaultTrustedClaimIssuer: 'complianceManager.removeDefaultTrustedClaimIssuer',
	ChangeComplianceRequirement: 'complianceManager.changeComplianceRequirement'
}

const CorporateActionTx = {
	SetMaxDetailsLength: 'corporateAction.setMaxDetailsLength',
	SetDefaultTargets: 'corporateAction.setDefaultTargets',
	SetDefaultWithholdingTax: 'corporateAction.setDefaultWithholdingTax',
	SetDidWithholdingTax: 'corporateAction.setDidWithholdingTax',
	InitiateCorporateAction: 'corporateAction.initiateCorporateAction',
	LinkCaDoc: 'corporateAction.linkCaDoc',
	RemoveCa: 'corporateAction.removeCa',
	ChangeRecordDate: 'corporateAction.changeRecordDate',
	InitiateCorporateActionAndDistribute: 'corporateAction.initiateCorporateActionAndDistribute'
}

const CorporateBallotTx = {
	AttachBallot: 'corporateBallot.attachBallot',
	Vote: 'corporateBallot.vote',
	ChangeEnd: 'corporateBallot.changeEnd',
	ChangeMeta: 'corporateBallot.changeMeta',
	ChangeRcv: 'corporateBallot.changeRcv',
	RemoveBallot: 'corporateBallot.removeBallot'
}

const PipsTx = {
	SetPruneHistoricalPips: 'pips.setPruneHistoricalPips',
	SetMinProposalDeposit: 'pips.setMinProposalDeposit',
	SetDefaultEnactmentPeriod: 'pips.setDefaultEnactmentPeriod',
	SetPendingPipExpiry: 'pips.setPendingPipExpiry',
	SetMaxPipSkipCount: 'pips.setMaxPipSkipCount',
	SetActivePipLimit: 'pips.setActivePipLimit',
	Propose: 'pips.propose',
	Vote: 'pips.vote',
	ApproveCommitteeProposal: 'pips.approveCommitteeProposal',
	RejectProposal: 'pips.rejectProposal',
	PruneProposal: 'pips.pruneProposal',
	RescheduleExecution: 'pips.rescheduleExecution',
	ClearSnapshot: 'pips.clearSnapshot',
	Snapshot: 'pips.snapshot',
	EnactSnapshotResults: 'pips.enactSnapshotResults',
	ExecuteScheduledPip: 'pips.executeScheduledPip',
	ExpireScheduledPip: 'pips.expireScheduledPip'
}

const PortfolioTx = {
	CreatePortfolio: 'portfolio.createPortfolio',
	DeletePortfolio: 'portfolio.deletePortfolio',
	MovePortfolioFunds: 'portfolio.movePortfolioFunds',
	RenamePortfolio: 'portfolio.renamePortfolio',
	QuitPortfolioCustody: 'portfolio.quitPortfolioCustody',
	AcceptPortfolioCustody: 'portfolio.acceptPortfolioCustody'
}

const ProtocolFeeTx = {
	ChangeCoefficient: 'protocolFee.changeCoefficient',
	ChangeBaseFee: 'protocolFee.changeBaseFee'
}

const SchedulerTx = {
	Schedule: 'scheduler.schedule',
	Cancel: 'scheduler.cancel',
	ScheduleNamed: 'scheduler.scheduleNamed',
	CancelNamed: 'scheduler.cancelNamed',
	ScheduleAfter: 'scheduler.scheduleAfter',
	ScheduleNamedAfter: 'scheduler.scheduleNamedAfter'
}

const SettlementTx = {
	CreateVenue: 'settlement.createVenue',
	UpdateVenueDetails: 'settlement.updateVenueDetails',
	UpdateVenueType: 'settlement.updateVenueType',
	AddInstruction: 'settlement.addInstruction',
	AddAndAffirmInstruction: 'settlement.addAndAffirmInstruction',
	AffirmInstruction: 'settlement.affirmInstruction',
	WithdrawAffirmation: 'settlement.withdrawAffirmation',
	RejectInstruction: 'settlement.rejectInstruction',
	AffirmWithReceipts: 'settlement.affirmWithReceipts',
	ClaimReceipt: 'settlement.claimReceipt',
	UnclaimReceipt: 'settlement.unclaimReceipt',
	SetVenueFiltering: 'settlement.setVenueFiltering',
	AllowVenues: 'settlement.allowVenues',
	DisallowVenues: 'settlement.disallowVenues',
	ChangeReceiptValidity: 'settlement.changeReceiptValidity',
	ExecuteScheduledInstruction: 'settlement.executeScheduledInstruction',
	RescheduleInstruction: 'settlement.rescheduleInstruction'
}

const StatisticsTx = {
	AddTransferManager: 'statistics.addTransferManager',
	RemoveTransferManager: 'statistics.removeTransferManager',
	AddExemptedEntities: 'statistics.addExemptedEntities',
	RemoveExemptedEntities: 'statistics.removeExemptedEntities',
	SetAssetTransferCompliance: 'statistics.setAssetTransferCompliance',
	SetEntitiesExempt: 'statistics.setEntitiesExempt',
	SetActiveAssetStats: 'statistics.setActiveAssetStats',
	BatchUpdateAssetStats: 'statistics.batchUpdateAssetStats'
}

const StoTx = {
	CreateFundraiser: 'sto.createFundraiser',
	Invest: 'sto.invest',
	FreezeFundraiser: 'sto.freezeFundraiser',
	UnfreezeFundraiser: 'sto.unfreezeFundraiser',
	ModifyFundraiserWindow: 'sto.modifyFundraiserWindow',
	Stop: 'sto.stop'
}

const TreasuryTx = {
	Disbursement: 'treasury.disbursement',
	Reimbursement: 'treasury.reimbursement'
}

const UtilityTx = {
	Batch: 'utility.batch',
	BatchAtomic: 'utility.batchAtomic',
	BatchOptimistic: 'utility.batchOptimistic',
	RelayTx: 'utility.relayTx'
}

const ExternalAgentsTx = {
	CreateGroup: 'externalAgents.createGroup',
	SetGroupPermissions: 'externalAgents.setGroupPermissions',
	RemoveAgent: 'externalAgents.removeAgent',
	Abdicate: 'externalAgents.abdicate',
	ChangeGroup: 'externalAgents.changeGroup',
	AcceptBecomeAgent: 'externalAgents.acceptBecomeAgent',
	CreateGroupAndAddAuth: 'externalAgents.createGroupAndAddAuth',
	CreateAndChangeCustomGroup: 'externalAgents.createAndChangeCustomGroup'
}

const RelayerTx = {
	SetPayingKey: 'relayer.setPayingKey',
	AcceptPayingKey: 'relayer.acceptPayingKey',
	RemovePayingKey: 'relayer.removePayingKey',
	UpdatePolyxLimit: 'relayer.updatePolyxLimit',
	IncreasePolyxLimit: 'relayer.increasePolyxLimit',
	DecreasePolyxLimit: 'relayer.decreasePolyxLimit'
}

const RewardsTx = {
	ClaimItnReward: 'rewards.claimItnReward',
	SetItnRewardStatus: 'rewards.setItnRewardStatus'
}

const TestUtilsTx = {
	RegisterDid: 'testUtils.registerDid',
	MockCddRegisterDid: 'testUtils.mockCddRegisterDid',
	GetMyDid: 'testUtils.getMyDid',
	GetCddOf: 'testUtils.getCddOf'
}

const PolymeshContractsTx = {
	Call: 'polymeshContracts.call',
	InstantiateWithCode: 'polymeshContracts.instantiateWithCode',
	Instantiate: 'polymeshContracts.instantiate',
	UploadCode: 'polymeshContracts.uploadCode',
	RemoveCode: 'polymeshContracts.removeCode',
	InstantiateWithCodePerms: 'polymeshContracts.instantiateWithCodePerms',
	InstantiateWithHashPerms: 'polymeshContracts.instantiateWithHashPerms'
}

const PreimageTx = {
	NotePreimage: 'preimage.notePreimage',
	UnnotePreimage: 'preimage.unnotePreimage',
	RequestPreimage: 'preimage.requestPreimage',
	UnrequestPreimage: 'preimage.unrequestPreimage'
}

const ContractsTx = {
	Call: 'contracts.call',
	InstantiateWithCode: 'contracts.instantiateWithCode',
	Instantiate: 'contracts.instantiate',
	UploadCode: 'contracts.uploadCode',
	RemoveCode: 'contracts.removeCode'
}

export const TxTags = {
	system: SystemTx,
	babe: BabeTx,
	timestamp: TimestampTx,
	indices: IndicesTx,
	authorship: AuthorshipTx,
	balances: BalancesTx,
	identity: IdentityTx,
	cddServiceProviders: CddServiceProvidersTx,
	polymeshCommittee: PolymeshCommitteeTx,
	committeeMembership: CommitteeMembershipTx,
	technicalCommittee: TechnicalCommitteeTx,
	technicalCommitteeMembership: TechnicalCommitteeMembershipTx,
	upgradeCommittee: UpgradeCommitteeTx,
	upgradeCommitteeMembership: UpgradeCommitteeMembershipTx,
	multiSig: MultiSigTx,
	bridge: BridgeTx,
	staking: StakingTx,
	session: SessionTx,
	grandpa: GrandpaTx,
	imOnline: ImOnlineTx,
	sudo: SudoTx,
	asset: AssetTx,
	capitalDistribution: CapitalDistributionTx,
	checkpoint: CheckpointTx,
	complianceManager: ComplianceManagerTx,
	corporateAction: CorporateActionTx,
	corporateBallot: CorporateBallotTx,
	pips: PipsTx,
	portfolio: PortfolioTx,
	protocolFee: ProtocolFeeTx,
	scheduler: SchedulerTx,
	settlement: SettlementTx,
	statistics: StatisticsTx,
	sto: StoTx,
	treasury: TreasuryTx,
	utility: UtilityTx,
	externalAgents: ExternalAgentsTx,
	relayer: RelayerTx,
	rewards: RewardsTx,
	testUtils: TestUtilsTx,
	polymeshContracts: PolymeshContractsTx,
	preimage: PreimageTx,
	contracts: ContractsTx
}

