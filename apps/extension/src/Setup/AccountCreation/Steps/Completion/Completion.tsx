import React, { useEffect, useState } from "react";
import { ExtensionRequester } from "extension";
import browser from "webextension-polyfill";

import { Button, ButtonVariant } from "@anoma/components";
import { SaveMnemonicMsg } from "background/keyring";
import { Ports } from "router";

import {
  BodyText,
  ButtonsContainer,
  CompletionViewContainer,
  CompletionViewUpperPartContainer,
  Header1,
} from "./Completion.components";

type Props = {
  alias: string;
  requester: ExtensionRequester;
  mnemonic: string[];
  password: string;
};

enum Status {
  Pending,
  Completed,
  Failed,
}

const Completion: React.FC<Props> = (props) => {
  const { alias, mnemonic, password, requester } = props;
  const [mnemonicStatus, setMnemonicStatus] = useState<Status>(Status.Pending);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (password && mnemonic) {
      (async () => {
        try {
          await requester.sendMessage<SaveMnemonicMsg>(
            Ports.Background,
            new SaveMnemonicMsg(mnemonic, password, alias)
          );
          setMnemonicStatus(Status.Completed);
        } catch (e) {
          console.error(e);
          setMnemonicStatus(Status.Failed);
        }

        setIsComplete(true);
      })();
    }
  }, []);

  return (
    <CompletionViewContainer>
      <CompletionViewUpperPartContainer>
        <Header1>Creating your wallet</Header1>
        {isComplete && (
          <BodyText>
            Setup is complete! You may close this tab and access the extension
            popup to view your accounts.
          </BodyText>
        )}
        {!isComplete && (
          <BodyText>One moment while your wallet is being created...</BodyText>
        )}
        <BodyText>
          Encrypting and storing mnemonic:{" "}
          {mnemonicStatus === Status.Completed && <i>Complete!</i>}
          {mnemonicStatus === Status.Pending && <i>Pending...</i>}
          {mnemonicStatus === Status.Failed && <i>Failed</i>}
        </BodyText>
      </CompletionViewUpperPartContainer>
      <ButtonsContainer>
        <Button
          variant={ButtonVariant.Contained}
          onClick={async () => {
            const tab = await browser.tabs.getCurrent();
            if (tab.id) {
              browser.tabs.remove(tab.id);
            }
          }}
          disabled={!isComplete}
        >
          Close
        </Button>
      </ButtonsContainer>
    </CompletionViewContainer>
  );
};

export default Completion;