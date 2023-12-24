import generateAgentNameHandler from "../api/agents/add-agent/generate-agent-name.js";
import generateExpertiseHandler from "../api/agents/add-agent/generate-expertise.js";
import generateAgentProfilePicHandler from "../api/agents/add-agent/generate-agent-profile-pic.js";

import saveAgentToSupabaseHandler from "../api/agents/add-agent/save-agent-to-supabase.js";
import generateImagePromptForReportHandler from "../api/reports/save-report/generate-image-prompt-for-report.js";
import generateReportImageHandler from "../api/reports/save-report/generate-report-image.js";

import uploadImageToGcsHandler from "../api/reports/save-report/upload-image-to-gcs/upload-image-to-gcs.js";
import generateReportSummaryHandler from "../api/reports/save-report/generate-report-summary.js";
import saveReportToSupabaseHandler from "../api/reports/save-report/save-report-to-supabase.js";
import updateReportInSupabaseHandler from "../api/reports/save-report/update-report-in-supabase.js";
import streamContinuumDraftHandler from "../api/reports/continua/stream-continuum-draft-handler.js";
import getResearchLinkFromUserHandler from "../api/reports/save-linked-report/get-research-link-from-user.js";
import saveLinkHandler from "../api/reports/save-report/save-link.js";
import handleReportFolderingHandler from "../api/reports/save-report/handle-report-foldering.js";
import regenerateFolderNameHandler from "../api/reports/regenerate-folder/regenerate-folder-name.js";
import generateFolderImagePromptHandler from "../api/reports/regenerate-folder/generate-folder-image-prompt.js";
import generateFolderImageHandler from "../api/reports/regenerate-folder/generate-folder-image.js";

import saveFolderNameAndImageHandler from "../api/reports/regenerate-folder/save-folder-name-and-image.js";
import generateResearchLinkHandler from "../api/reports/continua/generate-research-link.js";
import queueRegenerateFolderTaskHandler from "../api/reports/regenerate-folder/queue-regenerate-folder-task.js";
import writeQuickDraftHandler from "../api/reports/quick-draft/quick-draft.js";
import saveFolderIdToFirebaseHandler from "../api/reports/save-report/save-folder-id-to-firebase.js";

export default function taskSchema() {
  return {
    quickDraft: {
      inputs: [
        "reportLength",
        "briefingInput",
        "userId",
        "existingExpertise",
        "feedbacks",
      ],
      outputs: ["draft"],
      subtasks: [
        {
          taskName: "generateExpertise",
          function: generateExpertiseHandler,
          inputs: [
            "existingExpertise",
            "briefingInput",
            "specializedTraining",
            "userId",
          ],
          outputs: ["expertiseOutput"],
        },
        {
          taskName: "writeQuickDraft",
          function: writeQuickDraftHandler,
          inputs: [
            "expertiseOutput",
            "briefingInput",
            "feedbacks",
            "userId",
            "previousDraft", // the previous draft to feebdack on
            "reportLength",
          ],
          outputs: ["draft"],
        },
      ],
    },
    regenerateReportImage: {
      inputs: ["childReportId", "draft", "userId"],
      outputs: [],
      subtasks: [
        {
          taskName: "getImagePromptForReport",
          function: generateImagePromptForReportHandler,
          inputs: ["draft"],
          outputs: ["imageDescriptionResponseContent", "draftTitle"],
        },
        {
          taskName: "generateReportImage",
          function: generateReportImageHandler,
          inputs: ["imageDescriptionResponseContent", "userId"],
          outputs: ["imageUrl", "draftTitle"],
        },
        {
          taskName: "uploadReportImageToGcs",
          function: uploadImageToGcsHandler,
          inputs: [
            "imageUrl",
            "draftTitle",
            "imageDescriptionResponseContent",
            "userId",
          ],
          outputs: ["reportPicUrl"],
        },

        {
          taskName: "updateReportInSupabase",
          function: updateReportInSupabaseHandler,
          endpoint: "/api/reports/save-report/save-report-to-supabase",
          inputs: [
            "childReportId",
            "reportPicUrl",
            "imageDescriptionResponseContent",
          ],
          outputs: ["childReportId"],
        },
      ],
    },
    continuum: {
      inputs: [
        "briefingInput",
        "reportLength",
        "parentReportId",
        "userId",
        "parentReportContent",
        "agentId",
        "expertises",
        "specializedTraining",
        "existingHyperlinks",
      ],
      outputs: [],
      subtasks: [
        {
          taskName: "generateResearchLink",
          function: generateResearchLinkHandler,
          inputs: [
            "parentReportId",
            "userId",
            "parentReportContent",
            "existingHyperlinks",
          ],
          outputs: ["researchLink", "briefingInput"],
        },
        {
          taskName: "steamContinuumDraft",
          function: streamContinuumDraftHandler,
          inputs: ["researchLink", "expertises", "userId", "reportLength"],
          outputs: ["draft"],
        },
        {
          taskName: "saveReportWithoutImage",
          function: saveReportToSupabaseHandler,
          inputs: ["draft", "userId"],
          outputs: ["childReportId"],
        },
        {
          taskName: "handleReportFoldering",
          function: handleReportFolderingHandler,
          inputs: ["childReportId", "parentReportId", "userId"],
          outputs: ["folderId"],
        },
        {
          taskName: "saveFolderIdToFirebase",
          function: saveFolderIdToFirebaseHandler,
          inputs: ["folderId", "userId"],
          outputs: [],
        },

        {
          taskName: "getImagePromptForReport",
          function: generateImagePromptForReportHandler,
          inputs: ["draft"],
          outputs: ["imageDescriptionResponseContent"],
        },
        {
          taskName: "generateReportImage",
          function: generateReportImageHandler,
          inputs: ["imageDescriptionResponseContent", "userId"],
          outputs: ["imageUrl", "draftTitle"],
        },
        {
          taskName: "uploadReportImageToGcs",
          function: uploadImageToGcsHandler,
          inputs: [
            "imageUrl",
            "draftTitle",
            "imageDescriptionResponseContent",
            "userId",
          ],
          outputs: ["reportPicUrl"],
        },
        {
          taskName: "getReportSummary",
          function: generateReportSummaryHandler,
          endpoint: "/api/reports/save-report/generate-report-summary",
          inputs: ["draft"],
          outputs: ["reportSummary"],
        },
        {
          taskName: "updateReportInSupabase",
          function: updateReportInSupabaseHandler,
          endpoint: "/api/reports/save-report/save-report-to-supabase",
          inputs: [
            "childReportId",
            "draft",
            "agentId",
            "userId",
            "reportPicUrl",
            "reportSummary",
            "briefingInput",
            "draftTitle",
            "imageDescriptionResponseContent",
          ],
          outputs: ["childReportId"],
        },

        {
          taskName: "saveLink",
          function: saveLinkHandler,
          inputs: ["parentReportId", "childReportId", "userId", "researchLink"],
          outputs: ["saveLinksData"],
        },
      ],
    },
    finalizeAndVisualizeReport: {
      inputs: [
        "draft",
        "briefingInput",
        "userId",
        "parentReportId",
        "expertiseOutput",
        "specializedTraining",
      ],
      outputs: [],
      subtasks: [
        {
          taskName: "saveReportWithoutImage",
          function: saveReportToSupabaseHandler,
          inputs: ["draft", "userId", "briefingInput"],
          outputs: ["childReportId"],
        },
        {
          taskName: "handleReportFoldering",
          function: handleReportFolderingHandler,
          inputs: ["childReportId", "parentReportId", "userId"],
          outputs: ["folderId"],
        },
        {
          taskName: "saveFolderIdToFirebase",
          function: saveFolderIdToFirebaseHandler,
          inputs: ["folderId", "userId"],
          outputs: [],
        },

        {
          taskName: "getImagePromptForReport",
          function: generateImagePromptForReportHandler,
          inputs: ["draft"],
          outputs: ["imageDescriptionResponseContent"],
        },
        {
          taskName: "generateReportImage",
          function: generateReportImageHandler,
          inputs: ["imageDescriptionResponseContent", "userId"],
          outputs: ["imageUrl", "draftTitle"],
        },
        {
          taskName: "uploadReportImageToGcs",
          function: uploadImageToGcsHandler,
          inputs: [
            "imageUrl",
            "draftTitle",
            "imageDescriptionResponseContent",
            "userId",
          ],
          outputs: ["reportPicUrl"],
        },
        {
          taskName: "getReportSummary",
          function: generateReportSummaryHandler,
          endpoint: "/api/reports/save-report/generate-report-summary",
          inputs: ["draft"],
          outputs: ["reportSummary"],
        },
        {
          taskName: "updateReportInSupabase",
          function: updateReportInSupabaseHandler,
          endpoint: "/api/reports/save-report/save-report-to-supabase",
          inputs: [
            "childReportId",
            "draft",
            "agentId",
            "userId",
            "reportPicUrl",
            "reportSummary",
            "briefingInput",
            "draftTitle",
            "imageDescriptionResponseContent",
          ],
          outputs: ["childReportId"],
        },
        {
          taskName: "queueRegenerateFolderTask",
          function: queueRegenerateFolderTaskHandler,
          inputs: ["folderId", "userId"],
          outputs: [],
        },
        {
          taskName: "generateAgentName",
          function: generateAgentNameHandler,
          inputs: ["expertiseOutput", "userId"],
          outputs: ["agentName", "bio"],
        },
        {
          taskName: "generateAgentProfilePic",
          function: generateAgentProfilePicHandler,
          inputs: ["agentName", "userId", "expertiseOutput"],
          outputs: ["imageUrl"],
        },
        {
          taskName: "uploadAgentProfilePic",
          function: uploadImageToGcsHandler,
          inputs: ["imageUrl", "agentName", "userId"],
          outputs: ["profilePicUrl"],
        },
        {
          taskName: "saveAgent",
          function: saveAgentToSupabaseHandler,
          inputs: [
            "profilePicUrl",
            "agentName",
            "bio",
            "expertiseOutput",
            "userId",
          ],
          outputs: ["agentId"],
        },
        {
          taskName: "updateReportInSupabase",
          function: updateReportInSupabaseHandler,
          endpoint: "/api/reports/save-report/save-report-to-supabase",
          inputs: [
            "childReportId",
            "draft",
            "agentId",
            "userId",
            "reportPicUrl",
            "reportSummary",
            "briefingInput",
            "draftTitle",
            "imageDescriptionResponseContent",
          ],
          outputs: ["childReportId"],
        },
      ],
    },
    saveLinkedReport: {
      inputs: [
        "userId",
        "agentId",
        "parentReportContent",
        "parentReportId",
        "hightlightedText",
        "elementId",
        "draft",
      ],
      outputs: [],
      subtasks: [
        {
          taskName: "saveReportWithoutImage",
          function: saveReportToSupabaseHandler,
          inputs: ["draft", "userId"],
          outputs: ["childReportId"],
        },
        {
          taskName: "handleReportFoldering",
          function: handleReportFolderingHandler,
          inputs: ["childReportId", "parentReportId", "userId"],
          outputs: ["folderId"],
        },
        {
          taskName: "saveFolderIdToFirebase",
          function: saveFolderIdToFirebaseHandler,
          inputs: ["folderId", "userId"],
          outputs: [],
        },

        {
          taskName: "getImagePromptForReport",
          function: generateImagePromptForReportHandler,
          inputs: ["draft"],
          outputs: ["imageDescriptionResponseContent"],
        },
        {
          taskName: "generateReportImage",
          function: generateReportImageHandler,
          inputs: ["imageDescriptionResponseContent", "userId"],
          outputs: ["imageUrl", "draftTitle"],
        },
        {
          taskName: "uploadReportImageToGcs",
          function: uploadImageToGcsHandler,
          inputs: [
            "imageUrl",
            "draftTitle",
            "imageDescriptionResponseContent",
            "userId",
          ],
          outputs: ["reportPicUrl"],
        },
        {
          taskName: "getReportSummary",
          function: generateReportSummaryHandler,
          endpoint: "/api/reports/save-report/generate-report-summary",
          inputs: ["draft"],
          outputs: ["reportSummary"],
        },
        {
          taskName: "updateReportInSupabase",
          function: updateReportInSupabaseHandler,
          endpoint: "/api/reports/save-report/save-report-to-supabase",
          inputs: [
            "childReportId",
            "draft",
            "agentId",
            "userId",
            "reportPicUrl",
            "reportSummary",
            "briefingInput",
            "draftTitle",
            "imageDescriptionResponseContent",
          ],
          outputs: ["childReportId"],
        },
        {
          taskName: "getResearchLinkFromUser",
          function: getResearchLinkFromUserHandler,
          inputs: ["userId", "highlightedText", "elementId"],
          outputs: ["researchLink"],
        },
        {
          taskName: "saveLink",
          function: saveLinkHandler,
          inputs: ["parentReportId", "childReportId", "userId", "researchLink"],
          outputs: ["saveLinksData"],
        },
      ],
    },
    regenerateFolder: {
      inputs: ["folderId", "userId"],
      outputs: [],
      subtasks: [
        {
          taskName: "regenerateFolderName",
          function: regenerateFolderNameHandler,
          inputs: ["folderId"],
          outputs: ["folderName, folderDescription"],
        },
        {
          taskName: "generateFolderImagePrompt",
          function: generateFolderImagePromptHandler,
          inputs: ["folderDescription", "userId"],
          outputs: ["folderImageResponse"],
        },
        {
          taskName: "generateFolderImage",
          function: generateFolderImageHandler,
          inputs: ["folderImageResponse", "userId"],
          outputs: ["imageUrl"],
        },
        {
          taskName: "uploadReportImageToGcs",
          function: uploadImageToGcsHandler,
          inputs: ["imageUrl", "folderImageResponse", "userId"],
          outputs: ["folderPicUrl"],
        },
        {
          taskName: "saveFolderNameAndImage",
          function: saveFolderNameAndImageHandler,
          inputs: [
            "folderPicUrl",
            "folderImageResponse",
            "folderId",
            "folderName",
            "folderDescription",
          ],
          outputs: [],
        },
      ],
    },
  };
}
