struct State {
    int configuredPort = -1;
};

{{ GENERATED_CODE }}

void evaluate(NodeId nid) {
    State* state = getState(nid);
    const int port = (int)getValue<input_PORT>(nid);
    if (port != state->configuredPort) {
        ::pinMode(port, OUTPUT);
        // Store configured port so to avoid repeating `pinMode` call if just
        // SIG is updated
        state->configuredPort = port;
    }

    const bool val = getValue<input_SIG>(nid);
    ::digitalWrite(port, val);
}
