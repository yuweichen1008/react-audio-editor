# Project Outline

This is the full-stack application using wavesurfer and tools to download video from url link, showing the audio waveform in frontend.

Feature: add note(annotation) to waveform region


# System Design
### Frontend

ReactJS
wavesurfer.js
GraphQL
graphql-codegen/cli

### Backend

Django
GraphQL


### Setup procedure

1. backend

```
cd backend
source env/bin/activate
cd myaudio
python manage.py runserver
```

If the backend django project not yet migrate, please migrate it first

2. frontend
```
cd frontend
nvm use 16***
yarn run start
```


# Status

- [ ] UI with TailwindCSS
- [ ] Frontend Codegen for GraphQL
- [ ] Update/Add region dynamical shown as list
- [ ] Link with API from Django
- [ ] Django Rest CSRF token workthrough
- [x] Backend Django init
- [ ] Frontend Annotation list with backend integration
- [ ] auth0 add on