// Museum Exhibit Studio — learner entrypoint.
//
// HOW TO EDIT THIS FILE
//
// Every place you write code is a named region between two marker lines:
//
//     >>> BEGIN <region> | Step 4: INSERT | Step 6: REPLACE
//     <<< END <region>
//
// The BEGIN line lists every step that touches the region. Each lesson block names its region
// and one of two actions:
//
//     INSERT   The region is empty. Paste the block between the two marker lines.
//     REPLACE  The region already has code. Delete everything between the two marker lines,
//              then paste the block.
//
// A block is always the complete contents of its region. Never edit, move, or delete a marker
// line, and leave the code outside the regions as it is.
//
// The pre-built curator helpers live in src/curator.ts. Do not edit that file: it is the
// application-owned half of the workshop, and it must stay identical to the finished app's copy.

// >>> BEGIN imports | Steps 1-2, 4-7: REPLACE
import { closeTerminal, describeFailure } from "./curator.js";
// <<< END imports

// >>> BEGIN curator-system-message | Step 3: INSERT | Step 6: REPLACE
// <<< END curator-system-message

// >>> BEGIN research-system-message | Step 6: INSERT
// <<< END research-system-message

// >>> BEGIN exhibit-prompt | Step 4: INSERT | Step 6: REPLACE
// <<< END exhibit-prompt

// >>> BEGIN html-prompt | Step 7: INSERT
// <<< END html-prompt

// >>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
// <<< END generation-config

// >>> BEGIN research-config | Step 6: INSERT
// <<< END research-config

// >>> BEGIN html-config | Step 7: INSERT
// <<< END html-config

// >>> BEGIN session-runner | Step 4: INSERT
// <<< END session-runner

async function main(): Promise<void> {
  try {
    // >>> BEGIN banner | Step 1: REPLACE
    console.log("=== Museum Exhibit Studio starter ===");
    console.log("Pre-built curator helpers are ready in src/curator.ts.");
    console.log("Continue with museum step 1 to write your first curator session.");
    // <<< END banner

    // >>> BEGIN choose-facts | Step 4: INSERT
    // <<< END choose-facts

    // >>> BEGIN research | Step 6: INSERT
    // <<< END research

    // >>> BEGIN generate | Step 1: INSERT | Steps 2-6: REPLACE
    // <<< END generate

    // >>> BEGIN validate | Step 5: INSERT
    // <<< END validate

    // >>> BEGIN sources | Step 6: INSERT
    // <<< END sources

    // >>> BEGIN exhibit-page | Step 7: INSERT
    // <<< END exhibit-page
  } catch (error) {
    console.error(describeFailure(error));
    process.exitCode = 1;
  } finally {
    closeTerminal();
  }
}

void main();
