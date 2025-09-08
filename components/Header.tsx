/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import { Agent, createNewAgent } from '@/lib/presets/agents';
import {
  useAgent,
  useUI,
  useUser,
  useAppMode,
  AppMode,
  LANGUAGES,
} from '@/lib/state';
import c from 'classnames';
import { useEffect, useState, useRef } from 'react';

export default function Header() {
  const { showUserConfig, setShowUserConfig, setShowAgentEdit } = useUI();
  const { name } = useUser();
  const { current, setCurrent, availablePresets, availablePersonal, addAgent } =
    useAgent();
  const { disconnect, connect, connected } = useLiveAPIContext();
  const { mode, setMode, targetLanguage, setTargetLanguage } = useAppMode();

  // State to manage automatic reconnection logic
  const [wantsToReconnect, setWantsToReconnect] = useState(false);
  const prevTargetLanguage = useRef(targetLanguage);

  const [showRoomList, setShowRoomList] = useState(false);

  useEffect(() => {
    const listener = () => setShowRoomList(false);
    addEventListener('click', listener);
    return () => removeEventListener('click', listener);
  }, []);

  // Effect to handle disconnecting when language changes to apply new settings
  useEffect(() => {
    const languageChanged = targetLanguage !== prevTargetLanguage.current;

    if (connected && mode === 'interpreter' && languageChanged) {
      disconnect();
      setWantsToReconnect(true);
    }

    prevTargetLanguage.current = targetLanguage;
  }, [targetLanguage, connected, mode, disconnect]);

  // Effect to handle reconnecting after config has been updated
  useEffect(() => {
    // The `connect` function is a dependency. It's a stable function that only
    // changes when the config inside useLiveAPIContext changes.
    // This ensures we use the new config when reconnecting.
    if (wantsToReconnect && !connected) {
      connect();
      setWantsToReconnect(false);
    }
  }, [connected, connect, wantsToReconnect]);

  function changeAgent(agent: Agent | string) {
    disconnect();
    setCurrent(agent);
  }

  function addNewChatterBot() {
    disconnect();
    addAgent(createNewAgent());
    setShowAgentEdit(true);
  }

  function handleLanguageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setTargetLanguage(e.target.value);
  }

  return (
    <header>
      <div className="header-left-controls">
        <div className="roomInfo">
          <div className="roomName">
            <button
              onClick={e => {
                e.stopPropagation();
                if (mode === 'chatterbot') {
                  setShowRoomList(!showRoomList);
                }
              }}
            >
              <h1
                className={c({
                  active: showRoomList && mode === 'chatterbot',
                })}
              >
                {mode === 'chatterbot' ? current.name : 'Interpreter'}
                {mode === 'chatterbot' && (
                  <span className="icon">arrow_drop_down</span>
                )}
              </h1>
            </button>

            {mode === 'chatterbot' && (
              <button
                onClick={() => setShowAgentEdit(true)}
                className="button createButton"
              >
                <span className="icon">edit</span> Edit
              </button>
            )}
          </div>

          {mode === 'chatterbot' && (
            <div className={c('roomList', { active: showRoomList })}>
              <div>
                <h3>Presets</h3>
                <ul>
                  {availablePresets
                    .filter(agent => agent.id !== current.id)
                    .map(agent => (
                      <li
                        key={agent.name}
                        className={c({ active: agent.id === current.id })}
                      >
                        <button onClick={() => changeAgent(agent)}>
                          {agent.name}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>

              <div>
                <h3>Your ChatterBots</h3>
                {
                  <ul>
                    {availablePersonal.length ? (
                      availablePersonal.map(({ id, name }) => (
                        <li
                          key={name}
                          className={c({ active: id === current.id })}
                        >
                          <button onClick={() => changeAgent(id)}>{name}</button>
                        </li>
                      ))
                    ) : (
                      <p>None yet.</p>
                    )}
                  </ul>
                }
                <button
                  className="newRoomButton"
                  onClick={() => {
                    addNewChatterBot();
                  }}
                >
                  <span className="icon">add</span>New ChatterBot
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="app-settings">
          <div className="setting-control">
            <label htmlFor="mode-select">Mode</label>
            <select
              id="mode-select"
              value={mode}
              onChange={e => {
                setShowRoomList(false);
                setMode(e.target.value as AppMode);
              }}
            >
              <option value="chatterbot">ChatterBot</option>
              <option value="interpreter">Interpreter</option>
            </select>
          </div>
          {mode === 'interpreter' && (
            <div className="setting-control">
              <label htmlFor="lang-select">Language</label>
              <select
                id="lang-select"
                value={targetLanguage}
                onChange={handleLanguageChange}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      <button
        className="userSettingsButton"
        onClick={() => setShowUserConfig(!showUserConfig)}
      >
        <p className="user-name">{name || 'Your name'}</p>
        <span className="icon">tune</span>
      </button>
    </header>
  );
}
