import { PhotographyReadRepository } from "../repositories/photography.read.repository"
import { PhotographyWriteRepository } from "../repositories/photography.write.repository"
import { PromptCompilerEngine } from "../engines/prompt-compiler.engine"
import { IdentityParserEngine } from "../engines/identity-parser.engine"
import type { GarmentIdentity, IdentityStatus, MasterReferences } from "../contracts/identity.contract"
import type { PromptRoleSlug, PhotographyVariables, CompiledPromptResult } from "../contracts/prompt.contract"

export class PhotographyService {
  /**
   * Loads product photography studio state (identity, templates, master references).
   */
  public static async getStudioState(productId: string, variantId?: string | null) {
    const [identityRecord, templates] = await Promise.all([
      PhotographyReadRepository.getProductIdentity(productId, variantId),
      PhotographyReadRepository.getAllPromptTemplates(),
    ])

    return {
      identityRecord,
      templates,
    }
  }

  /**
   * Compiles prompt for a specific role and product variables.
   */
  public static async compilePrompt(variables: PhotographyVariables): Promise<CompiledPromptResult> {
    const template = await PhotographyReadRepository.getPromptTemplate(variables.imageRoleSlug)
    return PromptCompilerEngine.compile(variables, template)
  }

  /**
   * Parses raw LLM output into structured GarmentIdentity.
   */
  public static parseRawIdentity(rawText: string) {
    return IdentityParserEngine.parse(rawText)
  }

  /**
   * Saves master references for a product.
   */
  public static async saveMasterReferences(
    productId: string,
    variantId: string | null | undefined,
    references: MasterReferences
  ) {
    return PhotographyWriteRepository.saveMasterReferences(productId, variantId, references)
  }

  /**
   * Saves structured product identity.
   */
  public static async saveProductIdentity(
    productId: string,
    variantId: string | null | undefined,
    identity: GarmentIdentity,
    rawOutput?: string
  ) {
    return PhotographyWriteRepository.saveProductIdentity(productId, variantId, identity, rawOutput)
  }

  /**
   * Updates identity status (DRAFT, REVIEWED, LOCKED).
   */
  public static async setIdentityStatus(
    productId: string,
    variantId: string | null | undefined,
    status: IdentityStatus
  ) {
    return PhotographyWriteRepository.setIdentityStatus(productId, variantId, status)
  }
}
