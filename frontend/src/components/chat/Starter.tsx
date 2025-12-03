import { useCallback, useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import {
  ChainlitContext,
  IStarter,
  IStep,
  useAuth,
  useChatData,
  useChatInteract
} from '@chainlit/react-client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { persistentCommandState } from '@/state/chat';

interface StarterProps {
  starter: IStarter;
}

export default function Starter({ starter }: StarterProps) {
  const apiClient = useContext(ChainlitContext);
  const selectedCommand = useRecoilValue(persistentCommandState);
  const { sendMessage } = useChatInteract();
  const { loading, connected } = useChatData();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const disabled = loading || !connected;
  const hasInputs = starter.inputs && starter.inputs.length > 0;

  const buildMessage = useCallback(
    (values: Record<string, string>) => {
      let message = starter.message;
      // Replace {input_id} placeholders with actual values
      Object.entries(values).forEach(([key, value]) => {
        message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
      return message;
    },
    [starter.message]
  );

  const submitMessage = useCallback(
    (messageText: string) => {
      const message: IStep = {
        threadId: '',
        id: uuidv4(),
        command: starter.command ?? selectedCommand?.id,
        name: user?.identifier || 'User',
        type: 'user_message',
        output: messageText,
        createdAt: new Date().toISOString(),
        metadata: { location: window.location.href }
      };
      sendMessage(message, []);
    },
    [user, selectedCommand, sendMessage, starter]
  );

  const onButtonClick = useCallback(() => {
    if (hasInputs) {
      // Initialize input values
      const initialValues: Record<string, string> = {};
      starter.inputs?.forEach((input) => {
        initialValues[input.id] = '';
      });
      setInputValues(initialValues);
      setModalOpen(true);
    } else {
      submitMessage(starter.message);
    }
  }, [hasInputs, starter, submitMessage]);

  const onModalSubmit = useCallback(() => {
    // Check required fields
    const missingRequired = starter.inputs?.some(
      (input) => input.required && !inputValues[input.id]?.trim()
    );
    if (missingRequired) return;

    const finalMessage = buildMessage(inputValues);
    submitMessage(finalMessage);
    setModalOpen(false);
    setInputValues({});
  }, [starter.inputs, inputValues, buildMessage, submitMessage]);

  const handleInputChange = (id: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onModalSubmit();
    }
  };

  return (
    <>
      <Button
        id={`starter-${starter.label.trim().toLowerCase().replaceAll(' ', '-')}`}
        variant="outline"
        className="w-fit justify-start rounded-3xl"
        disabled={disabled}
        onClick={onButtonClick}
      >
        <div className="flex gap-2">
          {starter.icon ? (
            <img
              className="h-5 w-5 rounded-md"
              src={
                starter.icon?.startsWith('/public')
                  ? apiClient.buildEndpoint(starter.icon)
                  : starter.icon
              }
              alt={starter.label}
            />
          ) : null}
          <p className="text-sm text-muted-foreground truncate">
            {starter.label}
          </p>
        </div>
      </Button>

      {hasInputs && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{starter.label}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              {starter.inputs?.map((input) => (
                <div key={input.id} className="flex flex-col gap-2">
                  <Label htmlFor={input.id}>
                    {input.label}
                    {input.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    id={input.id}
                    placeholder={input.placeholder || ''}
                    value={inputValues[input.id] || ''}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus={starter.inputs?.indexOf(input) === 0}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={onModalSubmit}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
