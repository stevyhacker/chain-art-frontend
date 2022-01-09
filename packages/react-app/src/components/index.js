import styled from "styled-components";

export const Header = styled.header`
  background-color: #282c34;
  min-height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  color: white;
`;

export const Body = styled.div`
  align-items: center;
  background-color: #282c34;
  color: white;
  display: flex;
  flex-direction: column;
  font-size: calc(10px + 2vmin);
  justify-content: center;
  min-height: calc(100vh - 70px);
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const Link = styled.a.attrs({
    target: "_blank",
    rel: "noopener noreferrer",
})`
  color: #61dafb;
  text-decoration: none;
  font-size: 1.5rem;
`;

export const SmallLink = styled.a.attrs({
    target: "_blank",
    rel: "noopener noreferrer",
})`
  color: #61dafb;
  font-size: 1.2rem;
  margin: 20px 20px;
`;

export const Button = styled.button`
  background-color: #aec00b;
  border: none;
  border-radius: 8px;
  color: #282c34;
  cursor: pointer;
  font-family: Menlo, monospace;
  font-size: 1rem;
  text-align: center;
  text-decoration: none;
  margin: 0px 20px;
  padding: 12px 24px;

  ${props => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;
